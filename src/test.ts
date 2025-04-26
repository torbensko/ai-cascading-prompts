import { extractSymbolsFromPrompt } from "./helpers/extractSymbolsFromPrompt";
import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { findSymbolDefinition } from "./helpers/findSymbolDefinition";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";

(async () => {
  const newPrompts = await findAllNewPromptFiles("./example");
  console.log("New prompt files:");
  console.log(newPrompts);

  const patterns = await loadPromptPatterns("./example");
  console.log("All patterns:");
  console.log(patterns);

  for (const prompt of newPrompts) {
    // Find the symbol definition for each new prompt
    const promptSymbols = extractSymbolsFromPrompt(prompt.);

    const matchingPatterns = getMatchingPatterns(patterns, prompt.targetPath);
    console.log(`Matching patterns for ${prompt.targetPath}:`);
    console.log(matchingPatterns);
  }

  process.exit();
})();