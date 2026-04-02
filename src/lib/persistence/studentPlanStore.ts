import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "student-plans.json");

async function ensureDb(): Promise<DbShape> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as DbShape;
  } catch {
    const init: DbShape = { students: {} };
    await writeFile(DATA_FILE, JSON.stringify(init, null, 2), "utf-8");
    return init;
  }
}

async function saveDb(db: DbShape) {
  await writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
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

