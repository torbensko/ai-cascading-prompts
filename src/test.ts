
import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { getPackageDependencies } from "./helpers/getPackageDependencies";
import { listCodebaseFiles } from "./helpers/listCodebaseFiles";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";
import { Prompt } from "./models/Prompt";

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
      const prompt = await Prompt.loadFromFile(promptFile);

      // add contextural information
      prompt.updatePatterns(getMatchingPatterns(patterns, prompt.targetPath));
      prompt.updateDependencies(dependencies);
      prompt.updateCodebase(codeFiles);

      console.log(`Producing: ${prompt.targetPath}\n`);
      const { fullPrompt, missingSymbols } = await prompt.generateFullPrompt();
      console.log(`---- PROMPT ----`);
      console.log(fullPrompt);
      console.log(`----`);
      console.log(`Missing symbols: ${missingSymbols.join(", ")}`);

      // await prompt.generateFile(true);
    } catch (error) {
      // will throw when a symbol is not found
      console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
    }
  }

  process.exit();
})();