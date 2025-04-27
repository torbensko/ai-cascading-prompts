"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPrompt = loadPrompt;
const extractSymbolsFromPrompt_1 = require("./extractSymbolsFromPrompt");
const findSymbolDefinition_1 = require("./findSymbolDefinition");
const Prompt_1 = require("../models/Prompt");
const splitPreamble_1 = require("./splitPreamble");
async function loadPrompt(file, rootDir = process.cwd()) {
    // 1️⃣  pre-amble vs. body
    const { preamble, body } = await (0, splitPreamble_1.splitPreamble)(file.promptPath);
    // 2️⃣  placeholders (body only)
    const { symbols: names, cleanedPrompt } = (0, extractSymbolsFromPrompt_1.extractSymbolsFromPrompt)(body);
    // 3️⃣  resolve symbols
    const defs = await Promise.all(names.map(async (sym) => (await (0, findSymbolDefinition_1.findSymbolDefinition)(sym, { rootDir }))?.[0]));
    const missing = names.filter((_, i) => !defs[i]);
    if (missing.length)
        throw new Error(`Missing symbol definitions for: ${missing.join(", ")}`);
    // 4️⃣  class instance
    return new Prompt_1.Prompt(cleanedPrompt, file.promptPath, file.targetPath, file.rootDir, defs.filter(Boolean), preamble);
}
