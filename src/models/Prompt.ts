import * as path from "node:path";
import * as fs from "node:fs/promises";
import { SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";
import { PackageJson } from "../helpers/getPackageDependencies";
import { packageDependenciesToString } from "../helpers/packageDependenciesToString";
import { Preamble } from "../helpers/splitPreamble";
import { sendPromptToOpenAI } from "../helpers/sendPromptToOpenAI";

export class Prompt {
  private patterns: PromptPattern[] = [];
  private dependencies: PackageJson | null = null;
  private codebaseFiles: string[] = [];

  constructor(
    public readonly basePrompt: string,
    public readonly promptPath: string,
    public readonly targetPath: string,
    public readonly rootDir: string,
    public readonly symbols: SymbolDefinition[] = [],
    readonly preamble: Preamble = {},
  ) { }

  /* ------------------------- mutators ----------------------------------- */

  updatePatterns(patterns: PromptPattern[]): this {
    this.patterns = patterns;
    return this;
  }

  updateDependencies(deps: PackageJson): this {
    this.dependencies = deps;
    return this;
  }

  /** Inject a listing of files present in the repository / src dir. */
  updateCodebase(files: string[]): this {
    this.codebaseFiles = files;
    return this;
  }

  /* ------------------------- assembler ---------------------------------- */

  generateFullPrompt(): string {
    const parts: string[] = [];

    /* 0️⃣  main prompt text */
    parts.push(this.basePrompt.trim());

    /* 1️⃣  pattern blocks */
    if (this.patterns.length) {
      parts.push(this.patterns.map((p) => p.content.trim()).join("\n"));
    }
    const outputPath = path.relative(
      this.rootDir,
      this.targetPath,
    ).replace(/\\/g, "/");

    parts.push(`The resulting code will be saved to: ${outputPath}`);

    /* 2️⃣  related symbol snippets */
    if (this.symbols.length) {
      const symText =
        this.symbols
          .map(
            (s) =>
              [
                `\nContents of ${s.filePath}:`,
                "```" + path.extname(s.filePath).slice(1),
                s.content,
                "```",
              ].join("\n"),
          )
          .join("\n\n") + "\n";

      parts.push(
        "## Related symbols",
        "Below provides some of the existing code referenced in the prompt.",
        symText,
      );
    }

    /* 3️⃣  code-base listing */
    if (this.codebaseFiles.length) {
      parts.push(
        "## Codebase",
        "For extra context, below is a listing of the files available in the codebase:",
        this.codebaseFiles.map(path => `- ${path}`).join("\n"),
      );
    }

    /* 4️⃣  package dependencies */
    if (this.dependencies) {
      parts.push(
        "## Package dependencies",
        "For extra context, below provides a list of the current project dependencies. Where possible, existing dependencies should be used.",
        packageDependenciesToString(this.dependencies),
      );
    }

    parts.push(
      "## Output",
      "The output should only include the code such that the result could be passed to the JSON.parse function. No other text should be included.",
      "Do not include any example usage in the output."
    )

    return parts.filter(Boolean).join("\n").trimEnd().replace(
      /(?<!\n)\n(?=##\s)/g,
      '\n\n'
    );
  }

  /**
   * Calls OpenAI with the full prompt text, then writes the assistant’s reply
   * to `this.targetPath`, creating any missing folders along the way.
   */
  async generateFile(): Promise<void> {
    const completion = await sendPromptToOpenAI(this);
    const content =
      completion.choices?.[0]?.message?.content?.trimStart() ?? "";

    // Ensure parent folders exist, then write.
    await fs.mkdir(path.dirname(this.targetPath), { recursive: true });
    await fs.writeFile(this.targetPath, content, "utf8");
  }
}