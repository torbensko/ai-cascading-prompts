import * as fs from "node:fs/promises";
import * as path from "node:path";
import { mapPromptToTarget } from "./mapPromptToTarget";

export interface PromptFile {
  promptPath: string;
  targetPath: string;
}

/**
 * Recursively scan `rootDir`, returning every *.prompt file
 * whose generated output file does **not** yet exist.
 *
 * @param rootDir – directory to start searching from
 * @returns absolute paths of “new” prompt files
 */
export async function findAllNewPromptFiles(
  rootDir: string
): Promise<PromptFile[]> {
  const results: PromptFile[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const resolved = path.join(current, entry.name);

      // Fast-path: if we’re in a ".prompts" directory, only look at files.
      if (entry.isDirectory()) {
        if (entry.name === ".prompts") {
          const promptFiles = await fs.readdir(resolved, {
            withFileTypes: true,
          });
          for (const pf of promptFiles) {
            if (pf.isFile() && pf.name.endsWith(".prompt")) {
              const promptPath = path.join(resolved, pf.name);
              const targetPath = mapPromptToTarget(promptPath);
              try {
                await fs.access(targetPath);      // exists?
              } catch {
                results.push({
                  promptPath,
                  targetPath,
                });         // missing – add to list
              }
            }
          }
          // No need to recurse inside “.prompts”
        } else {
          await walk(resolved);                   // keep descending
        }
      }
    }
  }

  await walk(path.resolve(rootDir));
  return results;
}