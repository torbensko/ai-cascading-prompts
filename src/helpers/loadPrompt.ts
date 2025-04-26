import * as fs from "node:fs/promises";
import * as path from "node:path";
import { extractSymbolsFromPrompt } from "./extractSymbolsFromPrompt";
import { SymbolDefinition, findSymbolDefinition } from "./findSymbolDefinition";

export interface PromptFile {
  promptPath: string;   // absolute path to *.prompt
  targetPath: string;   // absolute path to generated file
}

export interface PromptDefinition {
  /** The cleaned prompt text with $symbols$ stripped of the dollar signs */
  basePrompt: string;
  promptPath: string;
  targetPath: string;
  /** List of symbols referenced in the prompt that could not be resolved */
  missingSymbols: string[];
  /** Resolved metadata for every symbol referenced in the prompt */
  symbols: SymbolDefinition[];
}

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
): Promise<PromptDefinition> {
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

  // 3. Build the final structure, filtering out any unresolved symbols.
  return {
    basePrompt: cleanedPrompt.trim(),
    promptPath: file.promptPath,
    targetPath: file.targetPath,
    missingSymbols: symbolNames.filter((s, i) => !defs[i]),
    symbols: defs.filter(Boolean) as SymbolDefinition[],
  };
}