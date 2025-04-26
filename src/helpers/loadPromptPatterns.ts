import { promises as fs } from "fs";
import path from "path";

/**
 * One pattern file discovered by `loadPromptPatterns`.
 */
export interface PromptPattern {
  /** Absolute path to …/.patterns/index.pattern */
  fullPath: string;
  /** Same path but with the “​.patterns​” directory removed */
  matchPath: string;
  /** UTF-8 contents of the file */
  content: string;
}

/**
 * Recursively walks `rootDir` and returns every file that matches
 *   <rootDir>/**\/.patterns / index.pattern
 *
 * For each file it returns:
 *   • `fullPath` – the absolute path to the file
 *   • `matchPath` – the path with the “​.patterns​” segment stripped out
 * e.g. / src / models /.patterns / index.pattern → /src/models / index.pattern
 *   • `content`  – the UTF - 8 text of the file
 */
export async function loadPromptPatterns(
  rootDir: string
): Promise<PromptPattern[]> {
  const results: PromptPattern[] = [];

  /**
   * Depth-first walk of the directory tree.
   */
  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(entryPath);
          return;
        }

        // We only care about files called “index.pattern” whose parent folder is “.patterns”
        const isPatternFile =
          entry.isFile() &&
          entry.name === "index.pattern" &&
          path.basename(path.dirname(entryPath)) === ".patterns";

        if (!isPatternFile) return;

        const fullPath = entryPath;

        // Remove “…/.patterns/” from the path
        const matchPath = path.dirname(path.dirname(fullPath));
        console.log("reading file: ", fullPath);
        const content = await fs.readFile(fullPath, "utf8");
        results.push({ fullPath, matchPath, content });
      })
    );
  }

  await walk(path.resolve(rootDir));
  return results;
}

