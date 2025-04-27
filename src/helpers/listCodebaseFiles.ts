import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface ListOptions {
  /** File extensions to KEEP (include the dot).  Empty = all files.            */
  exts?: string[];                                // default: []
  /** RegExp or glob-like substrings to EXCLUDE when found in the filename.     */
  exclude?: (RegExp | string)[];                  // default: [/\.test\./, /\.spec\./]
  /** Directory names to skip entirely.                                         */
  ignoreDirs?: string[];                          // default: ["node_modules", ".git", "dist", "build"]
}

/**
 * Recursively gather **relative** file paths under `rootDir` that match the
 * given criteria.  Returned paths use forward-slashes.
 */
export async function listCodebaseFiles(
  rootDir: string,
  {
    exts = [],                             // no filter → keep every ext
    exclude = [/\.test\./, /\.spec\./],
    ignoreDirs = ["node_modules", ".git", "dist", "build"],
  }: ListOptions = {},
): Promise<string[]> {
  const absRoot = path.resolve(rootDir);
  const wantedExts = exts.map((e) => e.toLowerCase());
  const excludeMatchers = exclude.map((p) =>
    typeof p === "string" ? new RegExp(p) : p,
  );

  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (ignoreDirs.includes(entry.name)) continue;

      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const rel = path
          // relate to the root dir (not typically "src/")
          .relative(process.cwd(), full)
          .replaceAll(path.sep, "/");       // portable

        // 1️⃣  extension filter
        if (wantedExts.length) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!wantedExts.includes(ext)) continue;
        }

        // 2️⃣  exclusion patterns
        const skip = excludeMatchers.some((rx) => rx.test(entry.name));
        if (skip) continue;

        results.push(rel);
      }
    }
  }

  await walk(absRoot);
  return results.sort();
}