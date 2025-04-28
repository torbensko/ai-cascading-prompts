"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findAllNewPromptFiles_1 = require("./helpers/findAllNewPromptFiles");
const getMatchingPatterns_1 = require("./helpers/getMatchingPatterns");
const getPackageDependencies_1 = require("./helpers/getPackageDependencies");
const getPathAliases_1 = require("./helpers/getPathAliases");
const listCodebaseFiles_1 = require("./helpers/listCodebaseFiles");
const loadPromptPatterns_1 = require("./helpers/loadPromptPatterns");
const Prompt_1 = require("./models/Prompt");
const baseDir = "./src/example";
(async () => {
    const newPrompts = await (0, findAllNewPromptFiles_1.findAllNewPromptFiles)(baseDir);
    const patterns = await (0, loadPromptPatterns_1.loadPromptPatterns)(baseDir);
    const dependencies = await (0, getPackageDependencies_1.getPackageDependencies)();
    const importAliases = await (0, getPathAliases_1.getPathAliases)();
    // console.log("New prompt files:");
    // console.log(newPrompts);
    // console.log("All patterns:");
    // console.log(patterns);
    // console.log("Dependencies:");
    // console.log(packageDependenciesToString(dependencies));
    console.log("Import aliases:");
    console.log(importAliases);
    // … after you’ve constructed the Prompt instance via `loadPrompt`
    const codeFiles = await (0, listCodebaseFiles_1.listCodebaseFiles)(baseDir, { exts: [".ts", ".tsx"] });
    for (const promptFile of newPrompts) {
        // Find the symbol definition for each new prompt
        try {
            const prompt = await Prompt_1.Prompt.loadFromFile(promptFile);
            // add contextural information
            prompt.updatePatterns((0, getMatchingPatterns_1.getMatchingPatterns)(patterns, prompt.targetPath));
            prompt.updateDependencies(dependencies);
            prompt.updateCodebase(codeFiles);
            prompt.updateAliases(importAliases);
            console.log(`Producing: ${prompt.targetPath}\n`);
            const { fullPrompt, missingSymbols } = await prompt.generateFullPrompt();
            console.log(`---- PROMPT ----`);
            console.log(fullPrompt);
            console.log(`----`);
            console.log(`Missing symbols: ${missingSymbols.join(", ")}`);
            // await prompt.generateFile(true);
        }
        catch (error) {
            // will throw when a symbol is not found
            console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
        }
    }
    process.exit();
})();
