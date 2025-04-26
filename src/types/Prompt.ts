import { SymbolDefinition } from "../helpers/findSymbolDefinition";

export interface Prompt {
  // the prompt found in the prompt file
  basePrompt: string;
  promptPath: string;
  targetPath: string;
  // the symbols mentioned in the prompt
  symbols: SymbolDefinition[];
}