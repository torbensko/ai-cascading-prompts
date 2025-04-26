import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { findSymbolDefinition } from "./helpers/findSymbolDefinition";
import { getMatchingPatterns } from "./helpers/getMatchingPatterns";
import { loadPromptPatterns } from "./helpers/loadPromptPatterns";

(async () => {
  console.log(await findSymbolDefinition("UserDTO"));

  const newPrompts = await findAllNewPromptFiles("./example");
  console.log("New prompt files:");
  console.log(newPrompts);

  const patterns = await loadPromptPatterns("./example");
  console.log("All patterns:");
  console.log(patterns);

  for (const prompt of newPrompts) {
    const matchingPatterns = getMatchingPatterns(patterns, prompt.targetPath);
    console.log(`Matching patterns for ${prompt.targetPath}:`);
    console.log(matchingPatterns);
  }

  process.exit();
})();