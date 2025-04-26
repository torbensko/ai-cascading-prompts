import * as path from "path";

/**
 * Convert a `.prompt` file path inside a “.prompts” directory
 * to the path of the code file it is meant to generate.
 *
 * Example:
 *   "src/models/.prompts/User.ts.prompt"  ->  "src/models/User.ts"
 */
export function mapPromptToTarget(promptFilePath: string): string {
  const { dir, name /* ← "User.ts" */, base } = path.parse(promptFilePath);

  // Sanity-check the extension
  if (!base.endsWith(".prompt")) {
    throw new Error(`Expected *.prompt file, got: ${promptFilePath}`);
  }

  // Split the directory and remove the ".prompts" segment.
  const parts = dir.split(path.sep);
  const promptsIdx = parts.lastIndexOf(".prompts");
  if (promptsIdx === -1) {
    throw new Error(`Path does not contain ".prompts": ${promptFilePath}`);
  }
  parts.splice(promptsIdx, 1); // drop “.prompts”
  const targetDir = parts.join(path.sep);

  return path.join(targetDir, name); // keep “User.ts”
}
