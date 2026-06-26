import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StoredSession } from "@/lib/domain/models/session";
import { getSupabaseAdminClient, summarizeSupabaseError, type SupabaseDatabase } from "@/lib/persistence/supabaseServer";

export interface StudentRecord {
  studentId: string;
  activeSessionId: string | null;
  sessions: StoredSession[];
}

type StudentPlanRow = SupabaseDatabase["public"]["Tables"]["student_plans"]["Row"];
type StudentPlanInsert = SupabaseDatabase["public"]["Tables"]["student_plans"]["Insert"];

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

function toStoredSession(row: StudentPlanRow): StoredSession {
  return {
    id: row.id,
    studentId: row.student_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    answers: row.answers as unknown as StoredSession["answers"],
    scenario: row.scenario as unknown as StoredSession["scenario"],
    outputs: row.outputs ? (row.outputs as unknown as StoredSession["outputs"]) : undefined,
  };
}

function buildStoredSession(
  studentId: string,
  session: Omit<StoredSession, "id" | "createdAt"> & Partial<Pick<StoredSession, "id" | "createdAt">>,
): StoredSession {
  const now = new Date().toISOString();
  return {
    id: session.id ?? randomUUID(),
    createdAt: session.createdAt ?? now,
    updatedAt: now,
    studentId,
    answers: session.answers,
    scenario: session.scenario,
    outputs: session.outputs,
  };
}

function logAndThrowSupabaseError(operation: string, error: { code?: string; message?: string; details?: string; hint?: string }): never {
  console.error("[studentPlanStore] Supabase operation failed.", {
    operation,
    error: summarizeSupabaseError(error),
  });
  throw new Error(`Supabase student plan ${operation} failed: ${error.message}`);
}

async function getSupabaseStudentRecord(studentId: string): Promise<StudentRecord> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { studentId, activeSessionId: null, sessions: [] };

  const { data, error } = await supabase
    .from("student_plans")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) logAndThrowSupabaseError("record lookup", error);

  const rows = data ?? [];
  return {
    studentId,
    activeSessionId: rows.find((row) => row.is_active)?.id ?? null,
    sessions: rows.map(toStoredSession),
  };
}

async function getSupabaseActiveSession(studentId: string): Promise<StoredSession | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("student_plans")
    .select("*")
    .eq("student_id", studentId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) logAndThrowSupabaseError("active session lookup", error);

  const row = data?.[0];
  return row ? toStoredSession(row) : null;
}

async function saveSupabaseStudentSession(
  studentId: string,
  session: Omit<StoredSession, "id" | "createdAt"> & Partial<Pick<StoredSession, "id" | "createdAt">>,
): Promise<StoredSession> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return saveFileStudentSession(studentId, session);

  const full = buildStoredSession(studentId, session);
  const now = full.updatedAt ?? new Date().toISOString();

  const { error: deactivateError } = await supabase
    .from("student_plans")
    .update({ is_active: false, updated_at: now })
    .eq("student_id", studentId)
    .neq("id", full.id);

  if (deactivateError) logAndThrowSupabaseError("deactivate previous sessions", deactivateError);

  const payload: StudentPlanInsert = {
    id: full.id,
    student_id: studentId,
    created_at: full.createdAt,
    updated_at: now,
    is_active: true,
    answers: full.answers as unknown as StudentPlanInsert["answers"],
    scenario: full.scenario as unknown as StudentPlanInsert["scenario"],
    outputs: (full.outputs ?? null) as unknown as StudentPlanInsert["outputs"],
  };

  const { data, error } = await supabase.from("student_plans").upsert(payload, { onConflict: "id" }).select("*").single();
  if (error) logAndThrowSupabaseError("save session", error);

  return toStoredSession(data);
}

async function clearSupabaseActiveSession(studentId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return clearFileActiveSession(studentId);

  const { error } = await supabase
    .from("student_plans")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("student_id", studentId);

  if (error) logAndThrowSupabaseError("clear active session", error);
}

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

async function getFileStudentRecord(studentId: string): Promise<StudentRecord> {
  const db = await ensureDb();
  if (!db.students[studentId]) {
    db.students[studentId] = { studentId, activeSessionId: null, sessions: [] };
    await saveDb(db);
  }
  return db.students[studentId];
}

async function getFileActiveSession(studentId: string): Promise<StoredSession | null> {
  const db = await ensureDb();
  const record = db.students[studentId];
  if (!record || !record.activeSessionId) return null;
  return record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
}

async function saveFileStudentSession(studentId: string, session: Omit<StoredSession, "id" | "createdAt"> & Partial<Pick<StoredSession, "id" | "createdAt">>): Promise<StoredSession> {
  const db = await ensureDb();
  const record = db.students[studentId] ?? { studentId, activeSessionId: null, sessions: [] };
  const full = buildStoredSession(studentId, session);

  const existingIdx = record.sessions.findIndex((s) => s.id === full.id);
  if (existingIdx >= 0) record.sessions[existingIdx] = full;
  else record.sessions.push(full);

  record.activeSessionId = full.id;
  db.students[studentId] = record;
  await saveDb(db);
  return full;
}

async function clearFileActiveSession(studentId: string): Promise<void> {
  const db = await ensureDb();
  const record = db.students[studentId] ?? { studentId, activeSessionId: null, sessions: [] };
  record.activeSessionId = null;
  db.students[studentId] = record;
  await saveDb(db);
}

export async function getStudentRecord(studentId: string): Promise<StudentRecord> {
  return getSupabaseAdminClient() ? getSupabaseStudentRecord(studentId) : getFileStudentRecord(studentId);
}

export async function getActiveSession(studentId: string): Promise<StoredSession | null> {
  return getSupabaseAdminClient() ? getSupabaseActiveSession(studentId) : getFileActiveSession(studentId);
}

export async function saveStudentSession(studentId: string, session: Omit<StoredSession, "id" | "createdAt"> & Partial<Pick<StoredSession, "id" | "createdAt">>): Promise<StoredSession> {
  return getSupabaseAdminClient() ? saveSupabaseStudentSession(studentId, session) : saveFileStudentSession(studentId, session);
}

export async function clearActiveSession(studentId: string): Promise<void> {
  return getSupabaseAdminClient() ? clearSupabaseActiveSession(studentId) : clearFileActiveSession(studentId);
}

/** Counselor read: no auto-create; null if student has never saved a plan. */
export async function getStudentRecordForCounselor(studentId: string): Promise<StudentRecord | null> {
  if (getSupabaseAdminClient()) {
    const record = await getSupabaseStudentRecord(studentId);
    return record.sessions.length > 0 ? record : null;
  }

  const db = await ensureDb();
  const record = db.students[studentId];
  if (!record || record.sessions.length === 0) return null;
  return record;
}
