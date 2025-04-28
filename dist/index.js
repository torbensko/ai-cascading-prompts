"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findAllNewPromptFiles_1 = require("./helpers/findAllNewPromptFiles");
const getPathAliases_1 = require("./helpers/getPathAliases");
const getMatchingPatterns_1 = require("./helpers/getMatchingPatterns");
const getPackageDependencies_1 = require("./helpers/getPackageDependencies");
const listCodebaseFiles_1 = require("./helpers/listCodebaseFiles");
const loadPromptPatterns_1 = require("./helpers/loadPromptPatterns");
const Prompt_1 = require("./models/Prompt");
const baseDir = "./src";
(async () => {
    // Find all new prompt files
    const newPrompts = await (0, findAllNewPromptFiles_1.findAllNewPromptFiles)(baseDir);
    // Load all prompt patterns for all directories (filtered down per prompt)
    const patterns = await (0, loadPromptPatterns_1.loadPromptPatterns)(baseDir);
    // Load some contextural information to help the prompt correctly generate the file
    const dependencies = await (0, getPackageDependencies_1.getPackageDependencies)();
    const codeFiles = await (0, listCodebaseFiles_1.listCodebaseFiles)(baseDir, { exts: [".ts", ".tsx"] });
    const importAliases = await (0, getPathAliases_1.getPathAliases)();
    // as there can be dependencies between prompts, we keep trying until we have
    // resolved all of them or we are unable to resolve the remaining ones
    let remainingPrompts = [...newPrompts];
    // if a file is generated in a given iteration, we will perform another iteration
    // to see if we can resolve any of the remaining prompts
    let successfulIteration = true;
    do {
        successfulIteration = false;
        for (const promptFile of newPrompts) {
            console.log(`Producing: ${promptFile.targetPath}\n`);
            // Find the symbol definition for each new prompt
            try {
                const prompt = await Prompt_1.Prompt.loadFromFile(promptFile);
                const cascadingPatterns = (0, getMatchingPatterns_1.getMatchingPatterns)(patterns, prompt.targetPath);
                prompt.updatePatterns(cascadingPatterns);
                prompt.updateDependencies(dependencies);
                prompt.updateCodebase(codeFiles);
                prompt.updateAliases(importAliases);
                const success = await prompt.generateFile(true);
                if (success) {
                    remainingPrompts = remainingPrompts.filter(p => p.targetPath !== prompt.targetPath);
                    successfulIteration = true;
                }
            }
            catch (error) {
                // will throw when a symbol is not found
                console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
            }
        }
    } while (remainingPrompts.length > 0 && successfulIteration);
    process.exit();
})();
