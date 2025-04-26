import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";
import { findSymbolDefinition } from "./helpers/findSymbolDefinition";

(async () => {
  console.log(await findSymbolDefinition("UserDTO"));
  console.log(await findAllNewPromptFiles("../example"));
  process.exit();
})();