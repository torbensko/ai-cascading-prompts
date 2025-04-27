"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitPreamble = splitPreamble;
// helpers/splitPreamble.ts
const promises_1 = require("node:fs/promises");
/**
 * Reads `filePath`, returns `{ preamble, body }` where:
 *   • `preamble` – parsed key/value pairs ({} if none)
 *   • `body`     – everything after the first `---` delimiter
 */
async function splitPreamble(filePath) {
    const raw = await (0, promises_1.readFile)(filePath, "utf8");
    const lines = raw.split(/\r?\n/);
    const idx = lines.findIndex((l) => l.trim() === "---");
    if (idx === -1)
        return { preamble: {}, body: raw };
    const preamble = {};
    for (const l of lines.slice(0, idx)) {
        const line = l.trim();
        if (!line || line.startsWith("#"))
            continue; // skip blanks / comments
        const m = line.match(/^([^:]+):\s*(.*)$/); // key: value
        if (m)
            preamble[m[1].trim()] = m[2].trim();
    }
    return {
        preamble,
        body: lines.slice(idx + 1).join("\n"),
    };
}
