// helpers/splitPreamble.ts
import { readFile } from "node:fs/promises";

/** A record of “key: value” lines that appear before the first `---`. */
export type Preamble = Record<string, string>;

/**
 * Reads `filePath`, returns `{ preamble, body }` where:
 *   • `preamble` – parsed key/value pairs ({} if none)
 *   • `body`     – everything after the first `---` delimiter
 */
export async function splitPreamble(
  filePath: string,
): Promise<{ preamble: Preamble; body: string }> {
  const raw = await readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.trim() === "---");

  if (idx === -1) return { preamble: {}, body: raw };

  const preamble: Preamble = {};

  for (const l of lines.slice(0, idx)) {
    const line = l.trim();
    if (!line || line.startsWith("#")) continue;           // skip blanks / comments
    const m = line.match(/^([^:]+):\s*(.*)$/);             // key: value
    if (m) preamble[m[1].trim()] = m[2].trim();
  }

  return {
    preamble,
    body: lines.slice(idx + 1).join("\n"),
  };
}