import * as path from "node:path";
import { extractSymbolsFromPrompt } from "./extractSymbolsFromPrompt";
import { findSymbolDefinition, SymbolDefinition } from "./findSymbolDefinition";
import { Prompt } from "../models/Prompt";
import { PromptFile } from "./findAllNewPromptFiles";
import { splitPreamble } from "./splitPreamble";

export async function loadPrompt(
  file: PromptFile,
  rootDir: string = process.cwd(),
): Promise<Prompt> {
  // 1️⃣  pre-amble vs. body
  const { preamble, body } = await splitPreamble(file.promptPath);

  // 2️⃣  placeholders (body only)
  const { symbols: names, cleanedPrompt } = extractSymbolsFromPrompt(body);

  // 3️⃣  resolve symbols
  const defs = await Promise.all(
    names.map(async (sym) => (await findSymbolDefinition(sym, { rootDir }))?.[0]),
  );

  const missing = names.filter((_, i) => !defs[i]);
  if (missing.length) throw new Error(`Missing symbol definitions for: ${missing.join(", ")}`);

  // 4️⃣  class instance
  return new Prompt(
    cleanedPrompt,
    file.promptPath,
    file.targetPath,
    defs.filter(Boolean) as SymbolDefinition[],
    preamble,
  );
}