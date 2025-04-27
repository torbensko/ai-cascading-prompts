import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { getPackageDependencies } from "./helpers/getPackageDependencies";
import { listCodebaseFiles } from "./helpers/listCodebaseFiles";
import { loadPrompt } from "./helpers/loadPrompt";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";

const baseDir = "./src";

(async () => {
  const newPrompts = await findAllNewPromptFiles(baseDir);
  const patterns = await loadPromptPatterns(baseDir);
  const dependencies = await getPackageDependencies();
  const codeFiles = await listCodebaseFiles(baseDir, { exts: [".ts", ".tsx"] });

  for (const promptFile of newPrompts) {
    console.log(`Producing: ${promptFile.targetPath}\n`);
    // Find the symbol definition for each new prompt
    try {
      const prompt = await loadPrompt(promptFile, baseDir);
      prompt.updatePatterns(getMatchingPatterns(patterns, prompt.targetPath));
      prompt.updateDependencies(dependencies);
      prompt.updateCodebase(codeFiles);
      await prompt.generateFile(true);
    } catch (error) {
      // will throw when a symbol is not found
      console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
    }
  }

  process.exit();
})();