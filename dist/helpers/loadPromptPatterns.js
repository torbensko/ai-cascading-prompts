"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPromptPatterns = loadPromptPatterns;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Recursively walks `rootDir` and returns every file that matches
 *   <rootDir>/**\/.patterns / index.pattern
 *
 * For each file it returns:
 *   • `fullPath` – the absolute path to the file
 *   • `matchPath` – the path with the “​.patterns​” segment stripped out
 * e.g. / src / models /.patterns / index.pattern → /src/models / index.pattern
 *   • `content`  – the UTF - 8 text of the file
 */
async function loadPromptPatterns(rootDir) {
    const results = [];
    /**
     * Depth-first walk of the directory tree.
     */
    async function walk(dir) {
        const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
        await Promise.all(entries.map(async (entry) => {
            const entryPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(entryPath);
                return;
            }
            // We only care about files called “index.pattern” whose parent folder is “.patterns”
            const isPatternFile = entry.isFile() &&
                entry.name === "index.pattern" &&
                path_1.default.basename(path_1.default.dirname(entryPath)) === ".patterns";
            if (!isPatternFile)
                return;
            const fullPath = entryPath;
            // Remove “…/.patterns/” from the path
            const matchPath = path_1.default.dirname(path_1.default.dirname(fullPath));
            const content = await fs_1.promises.readFile(fullPath, "utf8");
            results.push({ fullPath, matchPath, content });
        }));
    }
    await walk(path_1.default.resolve(rootDir));
    return results;
}
