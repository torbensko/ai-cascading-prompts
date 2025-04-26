import * as fs from "node:fs/promises";
import * as path from "node:path";
import { extractSymbolsFromPrompt } from "./extractSymbolsFromPrompt";
import { findSymbolDefinition, SymbolDefinition } from "./findSymbolDefinition";
import { Prompt } from "../models/Prompt";
import { PromptFile } from "./findAllNewPromptFiles";

/**
 * Load a `*.prompt` file, extract its placeholders, and resolve each symbol
 * to the first matching definition in the code-base.
 *
 * @param file  An entry from `findAllNewPromptFiles`
 * @param rootDir  Where to start searching for symbol definitions (defaults to CWD)
 */
export async function loadPrompt(
  file: PromptFile,
  rootDir: string = process.cwd(),
): Promise<Prompt> {
  const raw = await fs.readFile(file.promptPath, "utf8");

  // 1. Strip the “$Symbol$” wrappers and collect the symbol names.
  const { symbols: symbolNames, cleanedPrompt } = extractSymbolsFromPrompt(raw);

  // 2. Resolve every symbol (run in parallel; ignore misses gracefully).
  const defs = await Promise.all(
    symbolNames.map(async (sym) => {
      const hit = await findSymbolDefinition(sym, { rootDir, firstOnly: true });
      return hit?.[0];                    // we only need the first match
    }),
  );

  // check if there are any missing symbols
  const missingSymbols = symbolNames.filter((_, i) => !defs[i]);
  if (missingSymbols.length > 0) {
    throw new Error(
      `Missing symbol definitions for: ${missingSymbols.join(", ")}`,
    );
  }

  // 3. Return a fully-formed *class instance*
  return new Prompt(
    cleanedPrompt,
    file.promptPath,
    file.targetPath,
    defs.filter(Boolean) as SymbolDefinition[],
  );
}