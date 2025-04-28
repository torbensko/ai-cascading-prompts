import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { getPathAliases } from "./helpers/getPathAliases";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { getPackageDependencies } from "./helpers/getPackageDependencies";
import { listCodebaseFiles } from "./helpers/listCodebaseFiles";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";
import { Prompt } from "./models/Prompt";

const baseDir = "./src";

(async () => {
  // Find all new prompt files
  const newPrompts = await findAllNewPromptFiles(baseDir);
  // Load all prompt patterns for all directories (filtered down per prompt)
  const patterns = await loadPromptPatterns(baseDir);
  // Load some contextural information to help the prompt correctly generate the file
  const dependencies = await getPackageDependencies();
  const codeFiles = await listCodebaseFiles(baseDir, { exts: [".ts", ".tsx"] });
  const importAliases = await getPathAliases();

  // as there can be dependencies between prompts, we keep trying until we have
  // resolved all of them or we are unable to resolve the remaining ones
  let remainingPrompts = [...newPrompts]
  // if a file is generated in a given iteration, we will perform another iteration
  // to see if we can resolve any of the remaining prompts
  let successfulIteration = true;

  do {
    successfulIteration = false;
    for (const promptFile of newPrompts) {
      console.log(`Producing: ${promptFile.targetPath}\n`);
      // Find the symbol definition for each new prompt
      try {
        const prompt = await Prompt.loadFromFile(promptFile);
        const cascadingPatterns = getMatchingPatterns(patterns, prompt.targetPath);
        prompt.updatePatterns(cascadingPatterns);
        prompt.updateDependencies(dependencies);
        prompt.updateCodebase(codeFiles);
        prompt.updateAliases(importAliases);
        const success = await prompt.generateFile(true);
        if (success) {
          remainingPrompts = remainingPrompts.filter(p => p.targetPath !== prompt.targetPath);
          successfulIteration = true;
        }
      } catch (error) {
        // will throw when a symbol is not found
        console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
      }
    }
  } while (remainingPrompts.length > 0 && successfulIteration);

  process.exit();
})();