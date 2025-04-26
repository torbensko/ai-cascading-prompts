import * as path from "node:path";
import { SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";

export class Prompt {
  /** `patterns` are prepended (in order) when `generateFullPrompt()` runs. */
  private patterns: PromptPattern[] = [];

  constructor(
    public readonly basePrompt: string,
    public readonly promptPath: string,
    public readonly targetPath: string,
    public readonly symbols: SymbolDefinition[] = [],
  ) { }

  /** Overwrite any existing list of patterns (return `this` for chaining) */
  updatePatterns(patterns: PromptPattern[]): this {
    this.patterns = patterns;
    return this;
  }

  /** Combine patterns + prompt + symbol meta into a single string. */
  generateFullPrompt(): string {
    /* 1️⃣  Pattern blocks (if any) */
    const patternText = this.patterns.map((p) => p.content.trim()).join("\n");

    /* 2️⃣  Symbol information (simple, language-agnostic) */
    const symbolText = this.symbols
      .map(
        (s) =>
          [
            `Contents of ${s.filePath}:`,
            `\`\`\`${path.extname(s.filePath).slice(1)}`,
            s.content,
            "```",
          ].join("\n"),
      )
      .join("\n");

    /* 3️⃣  Final assembly (skip empty parts) */
    return [patternText, this.basePrompt.trim(), symbolText]
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
}