import { extractSymbolsFromPrompt } from "./helpers/extractSymbolsFromPrompt";
import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { findSymbolDefinition } from "./helpers/findSymbolDefinition";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { getPackageDependencies } from "./helpers/getPackageDependencies";
import { listCodebaseFiles } from "./helpers/listCodebaseFiles";
import { loadPrompt } from "./helpers/loadPrompt";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";
import { packageDependenciesToString } from "./helpers/packageDependenciesToString";

const baseDir = "./src/example";

(async () => {
  const newPrompts = await findAllNewPromptFiles(baseDir);
  const patterns = await loadPromptPatterns(baseDir);
  const dependencies = await getPackageDependencies();

  // console.log("New prompt files:");
  // console.log(newPrompts);
  // console.log("All patterns:");
  // console.log(patterns);
  // console.log("Dependencies:");
  // console.log(packageDependenciesToString(dependencies));

  // … after you’ve constructed the Prompt instance via `loadPrompt`
  const codeFiles = await listCodebaseFiles(baseDir, { exts: [".ts", ".tsx"] });

  for (const promptFile of newPrompts) {
    // Find the symbol definition for each new prompt
    try {
      const prompt = await loadPrompt(promptFile, baseDir);

      // add contextural information
      prompt.updatePatterns(getMatchingPatterns(patterns, prompt.targetPath));
      prompt.updateDependencies(dependencies);
      prompt.updateCodebase(codeFiles);

      console.log(`Producing: ${prompt.targetPath}\n`);
      console.log(`---- PROMPT ----`);
      console.log(prompt.generateFullPrompt());
      console.log(`----`);
      // prompt.generateFile();
    } catch (error) {
      // will throw when a symbol is not found
      console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
    }
  }

  process.exit();
})();