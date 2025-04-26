import { extractSymbolsFromPrompt } from "./helpers/extractSymbolsFromPrompt";
import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { findSymbolDefinition } from "./helpers/findSymbolDefinition";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { loadPrompt } from "./helpers/loadPrompt";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";

(async () => {
  const newPrompts = await findAllNewPromptFiles("./example");
  console.log("New prompt files:");
  console.log(newPrompts);

  const patterns = await loadPromptPatterns("./example");
  console.log("All patterns:");
  console.log(patterns);

  for (const promptFile of newPrompts) {
    // Find the symbol definition for each new prompt
    try {
      const promptDetails = await loadPrompt(promptFile, "./example");
      promptDetails.updatePatterns(getMatchingPatterns(patterns, promptDetails.targetPath));

      console.log(`Producing: ${promptDetails.targetPath}`);
      console.log(`---- PROMPT ----`);
      console.log(promptDetails.generateFullPrompt());
      console.log(`----`);
    } catch (error) {
      // will throw when a symbol is not found
      console.error(`Error loading prompt from ${promptFile.promptPath}:`, error);
    }
  }

  process.exit();
})();