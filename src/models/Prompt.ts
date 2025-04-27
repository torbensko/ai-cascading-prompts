import * as path from "node:path";
import { SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";
import { PackageJson } from "../helpers/getPackageDependencies";
import { packageDependenciesToString } from "../helpers/packageDependenciesToString";

export class Prompt {
  /** `patterns` are prepended (in order) when `generateFullPrompt()` runs. */
  private patterns: PromptPattern[] = [];
  private dependencies: PackageJson | null = null;

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


  updateDependencies(dependencies: PackageJson) {
    this.dependencies = dependencies;
    return this;
  }

  /** Combine patterns + prompt + symbol meta into a single string. */
  generateFullPrompt(): string {
    let output = ""

    /* 1️⃣  Pattern blocks (if any) */
    output += this.patterns.map((p) => p.content.trim()).join("\n");
    output += "\n\n";
    output += this.basePrompt.trim();
    output += "\n\n";

    if (this.symbols.length > 0) {
      output += "## Related symbols\n";
      output += "Below provides some of the existing code referenced in the prompt.\n\n";

      /* 2️⃣  Symbol information (simple, language-agnostic) */
      output += this.symbols
        .map(
          (s) =>
            [
              `Contents of ${s.filePath}:`,
              `\`\`\`${path.extname(s.filePath).slice(1)}`,
              s.content,
              "```",
            ].join("\n"),
        )
        .join("\n\n");
      output += "\n\n";
    }

    if (this.dependencies) {
      /* 3️⃣  Package dependencies (if any) */
      const packageDependencies = packageDependenciesToString(this.dependencies);

      output += "## Package dependencies\n";
      output += packageDependencies;
      output += "Where possible, existing dependencies should be used.\n";
    }

    return output;
  }
}