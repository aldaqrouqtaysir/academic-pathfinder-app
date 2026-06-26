import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient, summarizeSupabaseError, type SupabaseDatabase } from "@/lib/persistence/supabaseServer";

export interface CounselorNote {
  id: string;
  studentId: string;
  body: string;
  createdAt: string;
}

interface NotesDb {
  notes: CounselorNote[];
}

type CounselorNoteRow = SupabaseDatabase["public"]["Tables"]["counselor_notes"]["Row"];
type CounselorNoteInsert = SupabaseDatabase["public"]["Tables"]["counselor_notes"]["Insert"];

function toCounselorNote(row: CounselorNoteRow): CounselorNote {
  return {
    id: row.id,
    studentId: row.student_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function logAndThrowSupabaseError(operation: string, error: { code?: string; message?: string; details?: string; hint?: string }): never {
  console.error("[counselorNotesStore] Supabase operation failed.", {
    operation,
    error: summarizeSupabaseError(error),
  });
  throw new Error(`Supabase counselor notes ${operation} failed: ${error.message}`);
}

async function listSupabaseNotesForStudent(studentId: string): Promise<CounselorNote[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return listFileNotesForStudent(studentId);

  const { data, error } = await supabase
    .from("counselor_notes")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) logAndThrowSupabaseError("list notes", error);

  return (data ?? []).map(toCounselorNote);
}

async function addSupabaseCounselorNote(studentId: string, body: string): Promise<CounselorNote> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return addFileCounselorNote(studentId, body);

  const note: CounselorNote = {
    id: randomUUID(),
    studentId,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  const payload: CounselorNoteInsert = {
    id: note.id,
    student_id: note.studentId,
    body: note.body,
    created_at: note.createdAt,
  };

  const { data, error } = await supabase.from("counselor_notes").insert(payload).select("*").single();
  if (error) logAndThrowSupabaseError("add note", error);

  return toCounselorNote(data);
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

let activeNotesFile: string | null = null;

async function loadFrom(dataDir: string): Promise<NotesDb> {
  const notesFile = path.join(dataDir, "counselor-notes.json");
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(notesFile, "utf-8");
    activeNotesFile = notesFile;
    return JSON.parse(raw) as NotesDb;
  } catch {
    const init: NotesDb = { notes: [] };
    await writeFile(notesFile, JSON.stringify(init, null, 2), "utf-8");
    activeNotesFile = notesFile;
    return init;
  }
}

async function load(): Promise<NotesDb> {
  const configured = configuredDataDir();
  const primaryDataDir = resolveDataDir(configured);
  try {
    return await loadFrom(primaryDataDir);
  } catch (error) {
    if (configured) throw error;
    const fallbackDataDir = resolveFallbackDataDir();
    console.warn("[counselorNotesStore] Default data directory is not writable; using temporary storage.", {
      primaryDataDir,
      fallbackDataDir,
      error: summarizeFsError(error),
    });
    return loadFrom(fallbackDataDir);
  }
}

async function save(db: NotesDb) {
  const configured = configuredDataDir();
  const notesFile = activeNotesFile ?? path.join(resolveDataDir(configured), "counselor-notes.json");
  try {
    await writeFile(notesFile, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    if (configured) throw error;
    const fallbackDataDir = resolveFallbackDataDir();
    const fallbackNotesFile = path.join(fallbackDataDir, "counselor-notes.json");
    console.warn("[counselorNotesStore] Could not write default notes file; using temporary storage.", {
      notesFile,
      fallbackNotesFile,
      error: summarizeFsError(error),
    });
    await mkdir(fallbackDataDir, { recursive: true });
    await writeFile(fallbackNotesFile, JSON.stringify(db, null, 2), "utf-8");
    activeNotesFile = fallbackNotesFile;
  }
}

async function listFileNotesForStudent(studentId: string): Promise<CounselorNote[]> {
  const db = await load();
  return db.notes
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function addFileCounselorNote(studentId: string, body: string): Promise<CounselorNote> {
  const db = await load();
  const note: CounselorNote = {
    id: randomUUID(),
    studentId,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  db.notes.push(note);
  await save(db);
  return note;
}

export async function listNotesForStudent(studentId: string): Promise<CounselorNote[]> {
  return getSupabaseAdminClient() ? listSupabaseNotesForStudent(studentId) : listFileNotesForStudent(studentId);
}

export async function addCounselorNote(studentId: string, body: string): Promise<CounselorNote> {
  return getSupabaseAdminClient() ? addSupabaseCounselorNote(studentId, body) : addFileCounselorNote(studentId, body);
}
