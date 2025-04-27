import * as path from "node:path";
import { SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";
import { PackageJson } from "../helpers/getPackageDependencies";
import { packageDependenciesToString } from "../helpers/packageDependenciesToString";
import { Preamble } from "../helpers/splitPreamble";

export class Prompt {
  private patterns: PromptPattern[] = [];
  private dependencies: PackageJson | null = null;

  constructor(
    public readonly basePrompt: string,
    public readonly promptPath: string,
    public readonly targetPath: string,
    public readonly symbols: SymbolDefinition[] = [],
    private readonly preamble: Preamble = {},      // ← key/value map
  ) { }

  updatePatterns(patterns: PromptPattern[]): this {
    this.patterns = patterns;
    return this;
  }

  updateDependencies(deps: PackageJson): this {
    this.dependencies = deps;
    return this;
  }

  /** Serialise the whole thing back into a single prompt string. */
  generateFullPrompt(): string {
    const parts: string[] = [];

    /* 2️⃣  main body */
    parts.push(this.basePrompt.trim() + "\n");

    /* 1️⃣  patterns */
    if (this.patterns.length) {
      parts.push(this.patterns.map((p) => p.content.trim()).join("\n"));
    }

    /* 3️⃣  symbol snippets */
    if (this.symbols.length) {
      const symText = this.symbols
        .map(
          (s) =>
            [
              `Contents of ${s.filePath}:`,
              "```" + path.extname(s.filePath).slice(1),
              s.content,
              "```",
            ].join("\n"),
        )
        .join("\n\n") + "\n";

      parts.push(
        "\n## Related symbols",
        "Below provides some of the existing code referenced in the prompt.\n",
        symText,
      );
    }

    /* 4️⃣  dependencies */
    if (this.dependencies) {
      parts.push(
        "\n## Package dependencies",
        "Existing dependencies should be used where possible.",
        packageDependenciesToString(this.dependencies),
      );
    }

    return parts.filter(Boolean).join("\n").trimEnd();
  }
}