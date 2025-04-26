import { findAllNewPromptFiles } from "./helpers/findAllNewPromptFiles";

(async () => {
  console.log(await findAllNewPromptFiles("src/"));
  process.exit();
})();