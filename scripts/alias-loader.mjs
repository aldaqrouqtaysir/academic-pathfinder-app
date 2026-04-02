import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(process.cwd());

export async function resolve(specifier, context, nextResolve) {
  const parentPath = context.parentURL?.startsWith("file:")
    ? fileURLToPath(context.parentURL)
    : null;

  if (specifier.startsWith("@/")) {
    const fromAlias = specifier.slice(2); // remove "@/”
    const base = path.resolve(projectRoot, "src", fromAlias);

    const candidates = [
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return { url: pathToFileURL(c).href, shortCircuit: true };
      }
    }
  }

  // Allow extensionless relative TS imports in this workspace.
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !path.extname(specifier) && parentPath) {
    const base = path.resolve(path.dirname(parentPath), specifier);
    const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return { url: pathToFileURL(c).href, shortCircuit: true };
      }
    }
  }

  return nextResolve(specifier, context);
}

