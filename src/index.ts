import { findSymbolDefinition } from "./helpers/findSymbolDefinition";

(async () => {
  console.log(await findSymbolDefinition("UserDTO"));
  process.exit();
})();