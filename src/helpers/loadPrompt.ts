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

  // 4️⃣  class instance
  return new Prompt(
    body,
    file.promptPath,
    file.targetPath,
    file.rootDir,
    preamble,
  );
}