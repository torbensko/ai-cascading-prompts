import * as path from "node:path";
import * as fs from "node:fs/promises";
import { SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";
import { PackageJson } from "../helpers/getPackageDependencies";
import { packageDependenciesToString } from "../helpers/packageDependenciesToString";
import { Preamble } from "../helpers/splitPreamble";
import { sendPromptToOpenAI } from "../helpers/sendPromptToOpenAI";
import { extractCodeFromGptResponse } from "../helpers/extractCodeFromGptResponse";

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

  getPreamble(): Preamble {
    return this.preamble;
  }

  /* ------------------------- assembler ---------------------------------- */

  generateFullPrompt(): string {
    const parts: string[] = [];

    /* 0️⃣  main prompt text */
    parts.push(this.basePrompt.trim() + "\n");

    /* 1️⃣  pattern blocks */
    if (this.patterns.length) {
      parts.push(this.patterns.map((p) => p.content.trim()).join("\n\n"));
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
  async generateFile(writePromptToFile: boolean = false): Promise<void> {
    let wroteFile = false;
    let attempts = 0;
    do {
      attempts++;
      try {
        // check if there is a model specified in the preamble
        const promptSpecificModel = this.getPreamble().model?.trim()
        const fullPrompt = this.generateFullPrompt();
        const completion = await sendPromptToOpenAI(fullPrompt, promptSpecificModel);
        const content =
          completion.choices?.[0]?.message?.content?.trimStart() ?? "";
        const codeBlock = extractCodeFromGptResponse(content);

        // Ensure parent folders exist, then write.
        await fs.mkdir(path.dirname(this.targetPath), { recursive: true });
        await fs.writeFile(this.targetPath, codeBlock, "utf8");
        if (writePromptToFile) {
          const promptFilePath = `${this.targetPath}.fullPrompt`;
          console.log(`Writing prompt to ${promptFilePath}`);
          await fs.writeFile(promptFilePath, fullPrompt, "utf8");
        }
        wroteFile = true;
      } catch (error) {
        console.warn(`Error generating file for prompt ${this.promptPath}: ${error}`)
      }
    } while (!wroteFile && attempts < 3)
  }
}