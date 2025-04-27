"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findAllNewPromptFiles_1 = require("./helpers/findAllNewPromptFiles");
const getMatchingPatterns_1 = require("./helpers/getMatchingPatterns");
const getPackageDependencies_1 = require("./helpers/getPackageDependencies");
const listCodebaseFiles_1 = require("./helpers/listCodebaseFiles");
const loadPrompt_1 = require("./helpers/loadPrompt");
const loadPromptPatterns_1 = require("./helpers/loadPromptPatterns");
const baseDir = "./src";
(async () => {
    const newPrompts = await (0, findAllNewPromptFiles_1.findAllNewPromptFiles)(baseDir);
    const patterns = await (0, loadPromptPatterns_1.loadPromptPatterns)(baseDir);
    const dependencies = await (0, getPackageDependencies_1.getPackageDependencies)();
    const codeFiles = await (0, listCodebaseFiles_1.listCodebaseFiles)(baseDir, { exts: [".ts", ".tsx"] });
    for (const promptFile of newPrompts) {
        console.log(`Producing: ${promptFile.targetPath}\n`);
        // Find the symbol definition for each new prompt
        try {
            const prompt = await (0, loadPrompt_1.loadPrompt)(promptFile, baseDir);
            prompt.updatePatterns((0, getMatchingPatterns_1.getMatchingPatterns)(patterns, prompt.targetPath));
            prompt.updateDependencies(dependencies);
            prompt.updateCodebase(codeFiles);
            await prompt.generateFile(true);
        }
        catch (error) {
            // will throw when a symbol is not found
            console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
        }
    }
    process.exit();
})();
