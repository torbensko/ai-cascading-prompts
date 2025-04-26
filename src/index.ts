import { findSymbolDefinition } from "./helpers/findSymbolDefinition.js";

(async () => {
  console.log(await findSymbolDefinition("UserDTO"));
  process.exit();
})();