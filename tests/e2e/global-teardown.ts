import { rm } from "node:fs/promises";
import { assertSafeE2eDataDir, e2eDataDir } from "./environment";

export default async function globalTeardown() {
  assertSafeE2eDataDir(e2eDataDir);
  await rm(e2eDataDir, { recursive: true, force: true });
}
