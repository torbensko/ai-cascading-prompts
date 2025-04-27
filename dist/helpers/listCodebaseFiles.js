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
exports.listCodebaseFiles = listCodebaseFiles;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
/**
 * Recursively gather **relative** file paths under `rootDir` that match the
 * given criteria.  Returned paths use forward-slashes.
 */
async function listCodebaseFiles(rootDir, { exts = [], // no filter → keep every ext
exclude = [/\.test\./, /\.spec\./], ignoreDirs = ["node_modules", ".git", "dist", "build"], } = {}) {
    const absRoot = path.resolve(rootDir);
    const wantedExts = exts.map((e) => e.toLowerCase());
    const excludeMatchers = exclude.map((p) => typeof p === "string" ? new RegExp(p) : p);
    const results = [];
    async function walk(dir) {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            if (ignoreDirs.includes(entry.name))
                continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(full);
            }
            else {
                const rel = path
                    // relate to the root dir (not typically "src/")
                    .relative(process.cwd(), full)
                    .replaceAll(path.sep, "/"); // portable
                // 1️⃣  extension filter
                if (wantedExts.length) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (!wantedExts.includes(ext))
                        continue;
                }
                // 2️⃣  exclusion patterns
                const skip = excludeMatchers.some((rx) => rx.test(entry.name));
                if (skip)
                    continue;
                results.push(rel);
            }
        }
    }
    await walk(absRoot);
    return results.sort();
}
