"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findSymbolDefinition_1 = require("./helpers/findSymbolDefinition");
(async () => {
    console.log(await (0, findSymbolDefinition_1.findSymbolDefinition)("UserDTO"));
    process.exit();
})();
