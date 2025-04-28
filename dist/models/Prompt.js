"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs/promises"));
const findSymbolDefinition_1 = require("../helpers/findSymbolDefinition");
const packageDependenciesToString_1 = require("../helpers/packageDependenciesToString");
const splitPreamble_1 = require("../helpers/splitPreamble");
const sendPromptToOpenAI_1 = require("../helpers/sendPromptToOpenAI");
const extractCodeFromGptResponse_1 = require("../helpers/extractCodeFromGptResponse");
const extractSymbolsFromPrompt_1 = require("../helpers/extractSymbolsFromPrompt");
const promises_1 = require("node:fs/promises");
class Prompt {
    constructor(basePrompt, promptPath, targetPath, rootDir, preamble = {}) {
        this.basePrompt = basePrompt;
        this.promptPath = promptPath;
        this.targetPath = targetPath;
        this.rootDir = rootDir;
        this.preamble = preamble;
        this.patterns = [];
        this.dependencies = null;
        this.codebaseFiles = [];
        this.aliases = [];
    }
    /* ------------------------- mutators ----------------------------------- */
    updatePatterns(patterns) {
        this.patterns = patterns;
        return this;
    }
    updateDependencies(deps) {
        this.dependencies = deps;
        return this;
    }
    /** Inject a listing of files present in the repository / src dir. */
    updateCodebase(files) {
        this.codebaseFiles = files;
        return this;
    }
    updateAliases(importAliases) {
        this.aliases = importAliases;
        return this;
    }
    getPreamble() {
        return this.preamble;
    }
    /* ------------------------- assembler ---------------------------------- */
    async generateFullPrompt() {
        const outputPath = path.relative(this.rootDir, this.targetPath).replace(/\\/g, "/");
        const promptParts = [];
        /* main prompt text */
        promptParts.push(this.basePrompt.trim() + "\n");
        /* pattern blocks */
        if (this.patterns.length) {
            promptParts.push(this.patterns.reverse().map((p) => p.content.trim()).join("\n\n"));
        }
        // find any referenced symbols in the prompt, e.g. $User$
        const { symbols: symbolNames, cleanedPrompt } = (0, extractSymbolsFromPrompt_1.extractSymbolsFromPrompt)(promptParts.join("\n"));
        // find the definition for each symbol in the codebase
        const symbolDefs = [];
        let missingSymbols = [];
        await Promise.all(symbolNames.map(async (sym) => {
            const symbol = await (0, findSymbolDefinition_1.findSymbolDefinition)(sym, { rootDir: this.rootDir });
            if (symbol?.length) {
                symbolDefs.push(symbol[0]);
            }
            else {
                missingSymbols.push(sym);
            }
        }));
        const parts = [
            cleanedPrompt,
            "\n",
            `The resulting code will be saved to: ${outputPath}`
        ];
        /* related symbol snippets */
        if (symbolDefs.length) {
            const symText = symbolDefs
                .map((s) => [
                `\nContents of ${s.filePath}:`,
                "```" + path.extname(s.filePath).slice(1),
                s.content,
                "```",
            ].join("\n"))
                .join("\n\n") + "\n";
            parts.push("## Related symbols", "Below provides some of the existing code referenced in the prompt.", symText);
        }
        /* code-base listing */
        if (this.codebaseFiles.length) {
            parts.push("## Codebase", "For extra context, below is a listing of the files available in the codebase:", this.codebaseFiles.map(path => `- ${path}`).join("\n"));
        }
        /* import aliases */
        if (this.aliases.length) {
            parts.push("## Import aliases", "For extra context, below is a listing of the import aliases available in the codebase:", this.aliases.map(alias => `- ${alias.alias} -> ${alias.targets.join(", ")}`).join("\n"));
        }
        /* package dependencies */
        if (this.dependencies) {
            parts.push("## Package dependencies", "For extra context, below provides a list of the current project dependencies. Where possible, existing dependencies should be used.", (0, packageDependenciesToString_1.packageDependenciesToString)(this.dependencies));
        }
        parts.push("## Prompt Response", "The output should only include the code such that the result could be passed to the JSON.parse function. No other text should be included.", "Do not include any example usage in the output.");
        const finalPrompt = parts.filter(Boolean).join("\n").trimEnd().replace(/(?<!\n)\n(?=##\s)/g, '\n\n');
        return {
            fullPrompt: finalPrompt,
            missingSymbols,
        };
    }
    /**
     * Calls OpenAI with the full prompt text, then writes the assistant’s reply
     * to `this.targetPath`, creating any missing folders along the way.
     */
    async generateFile(writePromptToFile = false) {
        let wroteFile = false;
        let attempts = 0;
        do {
            attempts++;
            // check if there is a model specified in the preamble
            const promptSpecificModel = this.getPreamble().model?.trim();
            const { fullPrompt, missingSymbols } = await this.generateFullPrompt();
            if (missingSymbols.length) {
                console.warn(`Missing symbols: ${missingSymbols.join(", ")}`);
                return false;
            }
            const completion = await (0, sendPromptToOpenAI_1.sendPromptToOpenAI)(fullPrompt, promptSpecificModel);
            const content = completion.choices?.[0]?.message?.content?.trimStart() ?? "";
            try {
                // this can throw an error if the response does not follow the expected format
                const codeBlock = (0, extractCodeFromGptResponse_1.extractCodeFromGptResponse)(content);
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
            }
            catch (error) {
                console.warn(`Error generating file for prompt ${this.promptPath}: ${error}`);
            }
        } while (!wroteFile && attempts < 3);
        return wroteFile;
    }
    static async loadFromFile(file) {
        const fileContents = await (0, promises_1.readFile)(file.promptPath, "utf8");
        const { preamble, body } = await (0, splitPreamble_1.splitPreamble)(fileContents);
        // 4️⃣  class instance
        return new Prompt(body, file.promptPath, file.targetPath, file.rootDir, preamble);
    }
}
exports.Prompt = Prompt;
