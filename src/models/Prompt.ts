import * as path from "node:path";
import * as fs from "node:fs/promises";
import { findSymbolDefinition, SymbolDefinition } from "../helpers/findSymbolDefinition";
import { PromptPattern } from "../helpers/loadPromptPatterns";
import { PackageJson } from "../helpers/getPackageDependencies";
import { packageDependenciesToString } from "../helpers/packageDependenciesToString";
import { Preamble, splitPreamble } from "../helpers/splitPreamble";
import { sendPromptToOpenAI } from "../helpers/sendPromptToOpenAI";
import { extractCodeFromGptResponse } from "../helpers/extractCodeFromGptResponse";
import { extractSymbolsFromPrompt } from "../helpers/extractSymbolsFromPrompt";
import { PromptFile } from "../helpers/findAllNewPromptFiles";
import { readFile } from "node:fs/promises";
import { PathAlias } from "../helpers/getPathAliases";

export class Prompt {
  private patterns: PromptPattern[] = [];
  private dependencies: PackageJson | null = null;
  private codebaseFiles: string[] = [];
  private aliases: PathAlias[] = [];

  constructor(
    public readonly basePrompt: string,
    public readonly promptPath: string,
    public readonly targetPath: string,
    public readonly rootDir: string,
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

  updateAliases(importAliases: PathAlias[]) {
    this.aliases = importAliases;
    return this;
  }

  getPreamble(): Preamble {
    return this.preamble;
  }

  /* ------------------------- assembler ---------------------------------- */

  async generateFullPrompt(): Promise<{ fullPrompt: string, missingSymbols: string[] }> {

    const outputPath = path.relative(
      this.rootDir,
      this.targetPath,
    ).replace(/\\/g, "/");

    const promptParts: string[] = []
    /* main prompt text */
    promptParts.push(this.basePrompt.trim() + "\n");

    /* pattern blocks */
    if (this.patterns.length) {
      promptParts.push(this.patterns.reverse().map((p) => p.content.trim()).join("\n\n"));
    }

    // find any referenced symbols in the prompt, e.g. $User$
    const { symbols: symbolNames, cleanedPrompt } = extractSymbolsFromPrompt(promptParts.join("\n"));

    // find the definition for each symbol in the codebase
    const symbolDefs: SymbolDefinition[] = [];
    let missingSymbols: string[] = [];

    await Promise.all(
      symbolNames.map(async (sym) => {
        const symbol = await findSymbolDefinition(sym, { rootDir: this.rootDir });
        if (symbol?.length) {
          symbolDefs.push(symbol[0]);
        } else {
          missingSymbols.push(sym);
        }
      })
    );

    const parts: string[] = [
      cleanedPrompt,
      "\n",
      `The resulting code will be saved to: ${outputPath}`
    ];

    /* related symbol snippets */
    if (symbolDefs.length) {
      const symText =
        symbolDefs
          .map(
            (s: SymbolDefinition) =>
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

    /* code-base listing */
    if (this.codebaseFiles.length) {
      parts.push(
        "## Codebase",
        "For extra context, below is a listing of the files available in the codebase:",
        this.codebaseFiles.map(path => `- ${path}`).join("\n"),
      );
    }

    /* import aliases */
    if (this.aliases.length) {
      parts.push(
        "## Import aliases",
        "For extra context, below is a listing of the import aliases available in the codebase:",
        this.aliases.map(alias => `- ${alias.alias} -> ${alias.targets.join(", ")}`).join("\n"),
      );
    }

    /* package dependencies */
    if (this.dependencies) {
      parts.push(
        "## Package dependencies",
        "For extra context, below provides a list of the current project dependencies. Where possible, existing dependencies should be used.",
        packageDependenciesToString(this.dependencies),
      );
    }

    parts.push(
      "## Prompt Response",
      "The output should only include the code such that the result could be passed to the JSON.parse function. No other text should be included.",
      "Do not include any example usage in the output."
    )

    const finalPrompt = parts.filter(Boolean).join("\n").trimEnd().replace(
      /(?<!\n)\n(?=##\s)/g,
      '\n\n'
    );

    return {
      fullPrompt: finalPrompt,
      missingSymbols,
    };
  }

  /**
   * Calls OpenAI with the full prompt text, then writes the assistant’s reply
   * to `this.targetPath`, creating any missing folders along the way.
   */
  async generateFile(writePromptToFile: boolean = false): Promise<boolean> {
    let wroteFile = false;
    let attempts = 0;
    do {
      attempts++;

      // check if there is a model specified in the preamble
      const promptSpecificModel = this.getPreamble().model?.trim()
      const { fullPrompt, missingSymbols } = await this.generateFullPrompt();

      if (missingSymbols.length) {
        console.warn(`Missing symbols: ${missingSymbols.join(", ")}`);
        return false;
      }

      const completion = await sendPromptToOpenAI(fullPrompt, promptSpecificModel);
      const content =
        completion.choices?.[0]?.message?.content?.trimStart() ?? "";

      try {
        // this can throw an error if the response does not follow the expected format
        const codeBlock = extractCodeFromGptResponse(content);

        // Ensure parent folders exist, then write.
        await fs.mkdir(path.dirname(this.targetPath), { recursive: true });
        await fs.writeFile(this.targetPath, codeBlock, "utf8");

        // debug to allow the user to see the generated prompt
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

    return wroteFile;
  }

  static async loadFromFile(file: PromptFile): Promise<Prompt> {
    const fileContents = await readFile(file.promptPath, "utf8");
    const { preamble, body } = await splitPreamble(fileContents);

    // 4️⃣  class instance
    return new Prompt(
      body,
      file.promptPath,
      file.targetPath,
      file.rootDir,
      preamble,
    );
  }
}