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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPromptToTarget = mapPromptToTarget;
const path = __importStar(require("path"));
/**
 * Convert a `.prompt` file path inside a “.prompts” directory
 * to the path of the code file it is meant to generate.
 *
 * Example:
 *   "src/models/.prompts/User.ts.prompt"  ->  "src/models/User.ts"
 */
function mapPromptToTarget(promptFilePath) {
    const { dir, name /* ← "User.ts" */, base } = path.parse(promptFilePath);
    // Sanity-check the extension
    if (!base.endsWith(".prompt")) {
        throw new Error(`Expected *.prompt file, got: ${promptFilePath}`);
    }
    // Split the directory and remove the ".prompts" segment.
    const parts = dir.split(path.sep);
    const promptsIdx = parts.lastIndexOf(".prompts");
    if (promptsIdx === -1) {
        throw new Error(`Path does not contain ".prompts": ${promptFilePath}`);
    }
    parts.splice(promptsIdx, 1); // drop “.prompts”
    const targetDir = parts.join(path.sep);
    return path.join(targetDir, name); // keep “User.ts”
}
