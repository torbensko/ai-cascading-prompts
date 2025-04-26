// findSymbolDefinition.ts
import fs from "node:fs/promises";
import path from "node:path";

export interface SymbolDefinition {
  /** interface | class | enum | type | const | let | var | struct … */
  keyword: string;
  filePath: string;      // absolute path
  line: number;          // 1-based
  character: number;     // 1-based
  preview: string;       // first line of the match, trimmed
  content: string;       // full file content
}

export interface FindOptions {
  /** Folder to start searching (default = cwd) */
  rootDir?: string;
  /** List of extensions to include (default = common source extensions) */
  exts?: string[];
  /** Stop after the 1st hit (default = true) */
  firstOnly?: boolean;
}

/**
 * Grep-style search for a symbol definition by plain text.
 * Language-agnostic: looks for regexes like `\\b(interface|class)\\s+UserDTO\\b`.
 */
export async function findSymbolDefinition(
  symbol: string,
  opts: FindOptions = {},
): Promise<SymbolDefinition[] | null> {
  const {
    rootDir = process.cwd(),
    exts = [
      ".ts", ".tsx", ".js", ".jsx",
      ".mjs", ".cjs",
      ".java", ".kt", ".go", ".rs",
      ".cs", ".cpp", ".h", ".hpp",
      ".py", ".rb", ".php", ".swift",
    ],
    firstOnly = true,
  } = opts;

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

  const regex = new RegExp(
    `\\b(?:${KEYWORDS.join("|")})\\s+${symbol}\\b`,
    "i",
  );

  const hits: SymbolDefinition[] = [];

  /* -------------------------------------------------- */
  /* 1. Recursively gather file paths                   */
  /* -------------------------------------------------- */
  async function* walk(dir: string): AsyncGenerator<string> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* walk(full);
      } else if (exts.includes(path.extname(entry.name))) {
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
    if (!regex.test(content)) continue;

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(regex);
      if (m) {
        hits.push({
          keyword: m[0].split(/\s+/)[0],
          filePath: file,
          line: i + 1,
          character: (m.index ?? 0) + 1,
          preview: lines[i].trim(),
          content
        });
        if (firstOnly) return hits;
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