import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface CounselorNote {
  id: string;
  studentId: string;
  body: string;
  createdAt: string;
}

interface NotesDb {
  notes: CounselorNote[];
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

export async function listNotesForStudent(studentId: string): Promise<CounselorNote[]> {
  const db = await load();
  return db.notes
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addCounselorNote(studentId: string, body: string): Promise<CounselorNote> {
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
