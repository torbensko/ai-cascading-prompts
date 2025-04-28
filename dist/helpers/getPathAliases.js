"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathAliases = getPathAliases;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const typescript_1 = __importDefault(require("typescript"));
/**
 * Discover **active** path aliases in a tsconfig.json and return them
 * broken down into their constituent parts.
 *
 * @param tsconfigPath  Path to the tsconfig (defaults to "./tsconfig.json").
 * @returns             Array of PathAlias objects.
 */
function getPathAliases(tsconfigPath = "tsconfig.json") {
    const absoluteTsConfigPath = path.resolve(tsconfigPath);
    const projectDir = path.dirname(absoluteTsConfigPath);
    // --- 1. load & parse tsconfig (handles “extends”) -------------------------
    const read = typescript_1.default.readConfigFile(absoluteTsConfigPath, typescript_1.default.sys.readFile);
    if (read.error) {
        throw new Error(typescript_1.default.formatDiagnosticsWithColorAndContext([read.error], {
            getCanonicalFileName: (f) => f,
            getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
            getNewLine: () => typescript_1.default.sys.newLine,
        }));
    }
    const parseResult = typescript_1.default.parseJsonConfigFileContent(read.config, typescript_1.default.sys, projectDir);
    // TODO consider using fileNames for the file paths (rather than listCodebaseFiles)
    const paths = parseResult.options.paths ?? {};
    const aliases = [];
    // --- 2. iterate through aliases -------------------------------------------
    for (const [aliasPattern, targetGlobs] of Object.entries(paths)) {
        // Determine if ANY of its targets exist
        const resolved = targetGlobs.map((g) => path.resolve(projectDir, g));
        const isLive = resolved.some((abs) => {
            // Strip trailing globs (“/*”, “*”, “/**”) before testing
            const cleaned = abs.replace(/\*{1,2}$/, "");
            return fs.existsSync(cleaned);
        });
        if (!isLive)
            continue; // inactive: skip
        const wildcardIndex = aliasPattern.indexOf("*");
        aliases.push({
            alias: aliasPattern,
            prefix: wildcardIndex === -1
                ? aliasPattern
                : aliasPattern.slice(0, wildcardIndex),
            wildcard: wildcardIndex !== -1,
            targets: [...targetGlobs],
            resolvedTargets: resolved,
        });
    }
    return aliases;
}
/* -------- Example ----------------------------------
import { getPathAliasObjects } from "./getPathAliasObjects";
console.dir(getPathAliasObjects(), { depth: null });
----------------------------------------------------- */ 
