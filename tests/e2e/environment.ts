import path from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = fileURLToPath(new URL(".", import.meta.url));
export const repositoryRoot = path.resolve(testDirectory, "../..");
export const e2eDataDir = path.join(repositoryRoot, ".tmp", "e2e-data");

export function assertSafeE2eDataDir(target: string) {
  const resolved = path.resolve(target);
  const expected = path.resolve(repositoryRoot, ".tmp", "e2e-data");
  if (resolved !== expected || path.basename(resolved) !== "e2e-data") {
    throw new Error(`Refusing to clean an unexpected E2E data directory: ${resolved}`);
  }
}
