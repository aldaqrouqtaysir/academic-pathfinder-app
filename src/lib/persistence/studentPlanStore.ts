import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StoredSession } from "@/lib/domain/models/session";

interface StudentRecord {
  studentId: string;
  activeSessionId: string | null;
  sessions: StoredSession[];
}

interface DbShape {
  students: Record<string, StudentRecord>;
}

function configuredDataDir(): string | null {
  const configured = process.env.DATA_DIR?.trim();
  return configured || null;
}

function resolveDataDir(configured: string | null): string {
  if (!configured) return path.join(process.cwd(), ".data");
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function resolveFallbackDataDir(): string {
  return path.join(os.tmpdir(), "sais-academic-navigator");
}

function summarizeFsError(error: unknown) {
  if (error && typeof error === "object") {
    const maybe = error as { code?: unknown; message?: unknown; name?: unknown };
    return {
      name: typeof maybe.name === "string" ? maybe.name : "Error",
      code: typeof maybe.code === "string" ? maybe.code : undefined,
      message: typeof maybe.message === "string" ? maybe.message : String(error),
    };
  }
  return { name: "Error", message: String(error) };
}

let activeDataFile: string | null = null;

async function loadDbFrom(dataDir: string): Promise<DbShape> {
  const dataFile = path.join(dataDir, "student-plans.json");
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dataFile, "utf-8");
    activeDataFile = dataFile;
    return JSON.parse(raw) as DbShape;
  } catch {
    const init: DbShape = { students: {} };
    await writeFile(dataFile, JSON.stringify(init, null, 2), "utf-8");
    activeDataFile = dataFile;
    return init;
  }
}

async function ensureDb(): Promise<DbShape> {
  const configured = configuredDataDir();
  const primaryDataDir = resolveDataDir(configured);
  try {
    return await loadDbFrom(primaryDataDir);
  } catch (error) {
    if (configured) throw error;
    const fallbackDataDir = resolveFallbackDataDir();
    console.warn("[studentPlanStore] Default data directory is not writable; using temporary storage.", {
      primaryDataDir,
      fallbackDataDir,
      error: summarizeFsError(error),
    });
    return loadDbFrom(fallbackDataDir);
  }
}

async function saveDb(db: DbShape) {
  const configured = configuredDataDir();
  const dataFile = activeDataFile ?? path.join(resolveDataDir(configured), "student-plans.json");
  try {
    await writeFile(dataFile, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    if (configured) throw error;
    const fallbackDataDir = resolveFallbackDataDir();
    const fallbackDataFile = path.join(fallbackDataDir, "student-plans.json");
    console.warn("[studentPlanStore] Could not write default data file; using temporary storage.", {
      dataFile,
      fallbackDataFile,
      error: summarizeFsError(error),
    });
    await mkdir(fallbackDataDir, { recursive: true });
    await writeFile(fallbackDataFile, JSON.stringify(db, null, 2), "utf-8");
    activeDataFile = fallbackDataFile;
  }
}

export async function getStudentRecord(studentId: string): Promise<StudentRecord> {
  const db = await ensureDb();
  if (!db.students[studentId]) {
    db.students[studentId] = { studentId, activeSessionId: null, sessions: [] };
    await saveDb(db);
  }
  return db.students[studentId];
}

export async function getActiveSession(studentId: string): Promise<StoredSession | null> {
  const db = await ensureDb();
  const record = db.students[studentId];
  if (!record || !record.activeSessionId) return null;
  return record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
}

export async function saveStudentSession(studentId: string, session: Omit<StoredSession, "id" | "createdAt"> & Partial<Pick<StoredSession, "id" | "createdAt">>): Promise<StoredSession> {
  const db = await ensureDb();
  const record = db.students[studentId] ?? { studentId, activeSessionId: null, sessions: [] };

  const now = new Date().toISOString();
  const full: StoredSession = {
    id: session.id ?? randomUUID(),
    createdAt: session.createdAt ?? now,
    updatedAt: now,
    studentId,
    answers: session.answers,
    scenario: session.scenario,
    outputs: session.outputs,
  };

  const existingIdx = record.sessions.findIndex((s) => s.id === full.id);
  if (existingIdx >= 0) record.sessions[existingIdx] = full;
  else record.sessions.push(full);

  record.activeSessionId = full.id;
  db.students[studentId] = record;
  await saveDb(db);
  return full;
}

export async function clearActiveSession(studentId: string): Promise<void> {
  const db = await ensureDb();
  const record = db.students[studentId] ?? { studentId, activeSessionId: null, sessions: [] };
  record.activeSessionId = null;
  db.students[studentId] = record;
  await saveDb(db);
}

/** Counselor read: no auto-create; null if student has never saved a plan. */
export async function getStudentRecordForCounselor(studentId: string): Promise<StudentRecord | null> {
  const db = await ensureDb();
  const record = db.students[studentId];
  if (!record || record.sessions.length === 0) return null;
  return record;
}
