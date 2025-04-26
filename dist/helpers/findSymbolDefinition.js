// findSymbolDefinition.ts
import fs from "node:fs/promises";
import path from "node:path";
/**
 * Grep-style search for a symbol definition by plain text.
 * Language-agnostic: looks for regexes like `\\b(interface|class)\\s+UserDTO\\b`.
 */
export async function findSymbolDefinition(symbol, opts = {}) {
    const { rootDir = process.cwd(), exts = [
        ".ts", ".tsx", ".js", ".jsx",
        ".mjs", ".cjs",
        ".java", ".kt", ".go", ".rs",
        ".cs", ".cpp", ".h", ".hpp",
        ".py", ".rb", ".php", ".swift",
    ], firstOnly = true, } = opts;
    const KEYWORDS = [
        "interface",
        "class",
        "enum",
        "type",
        "struct",
        "record",
        "trait",
        "object",
        "const",
        "let",
        "var",
    ];
    const regex = new RegExp(`\\b(?:${KEYWORDS.join("|")})\\s+${symbol}\\b`, "i");
    const hits = [];
    /* -------------------------------------------------- */
    /* 1. Recursively gather file paths                   */
    /* -------------------------------------------------- */
    async function* walk(dir) {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                yield* walk(full);
            }
            else if (exts.includes(path.extname(entry.name))) {
                yield full;
            }
        }
    }
    /* -------------------------------------------------- */
    /* 2. Scan each file line by line                     */
    /* -------------------------------------------------- */
    for await (const file of walk(rootDir)) {
        const content = await fs.readFile(file, "utf8");
        // quick reject before splitting by lines
        if (!regex.test(content))
            continue;
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(regex);
            if (m) {
                hits.push({
                    keyword: m[0].split(/\s+/)[0],
                    fileName: file,
                    line: i + 1,
                    character: (m.index ?? 0) + 1,
                    preview: lines[i].trim(),
                });
                if (firstOnly)
                    return hits;
            }
        }
    }
    return hits.length ? hits : null;
}
/* -------------------------------------------------- */
/* Example usage                                      */
/* -------------------------------------------------- */
/*
(async () => {
  const result = await findSymbolDefinition("UserDTO", { rootDir: "./src", firstOnly: true });
  if (result) {
    const hit = result[0];
    console.log(
      `${hit.keyword} "${symbol}" defined in ${hit.fileName}:${hit.line}:${hit.character}\n` +
        hit.preview,
    );
  } else {
    console.log("Definition not found");
  }
})();
*/ 
