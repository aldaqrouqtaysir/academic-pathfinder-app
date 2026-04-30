import { mkdir, readFile, writeFile } from "node:fs/promises";
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

function resolveDataDir(): string {
  const configured = process.env.DATA_DIR?.trim();
  if (!configured) return path.join(process.cwd(), ".data");
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

const DATA_DIR = resolveDataDir();
const NOTES_FILE = path.join(DATA_DIR, "counselor-notes.json");

async function load(): Promise<NotesDb> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(NOTES_FILE, "utf-8");
    return JSON.parse(raw) as NotesDb;
  } catch {
    const init: NotesDb = { notes: [] };
    await writeFile(NOTES_FILE, JSON.stringify(init, null, 2), "utf-8");
    return init;
  }
}

async function save(db: NotesDb) {
  await writeFile(NOTES_FILE, JSON.stringify(db, null, 2), "utf-8");
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
