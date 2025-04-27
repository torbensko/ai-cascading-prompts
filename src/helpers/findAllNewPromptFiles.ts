import * as fs from "node:fs/promises";
import * as path from "node:path";
import { mapPromptToTarget } from "./mapPromptToTarget";

export interface PromptFile {
  promptPath: string;   // absolute *.prompt
  targetPath: string;   // absolute generated file
  rootDir: string;      // absolute root dir for this prompt
}

/**
 * Recursively walk `rootDir`, returning every *.prompt file whose companion
 * generated file is missing.
 */
export async function findAllNewPromptFiles(
  rootDir: string,
): Promise<PromptFile[]> {
  const absRoot = path.resolve(rootDir);     // 👉 guarantee absolute form
  const results: PromptFile[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const resolved = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === ".prompts") {
          const promptFiles = await fs.readdir(resolved, {
            withFileTypes: true,
          });

          for (const pf of promptFiles) {
            if (pf.isFile() && pf.name.endsWith(".prompt")) {
              const promptPath = path.join(resolved, pf.name); // absolute
              const targetPath = mapPromptToTarget(promptPath); // absolute

              try {
                await fs.access(targetPath); // generated file exists
              } catch {
                results.push({
                  promptPath,
                  targetPath,
                  rootDir: absRoot,          // always absolute
                });
              }
            }
          }
          // no need to descend further inside ".prompts"
        } else {
          await walk(resolved);              // recurse
        }
      }
    }
  }

  await walk(absRoot);
  return results;
}