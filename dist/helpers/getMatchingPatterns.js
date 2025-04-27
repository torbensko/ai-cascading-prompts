"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchingPatterns = getMatchingPatterns;
const path_1 = __importDefault(require("path"));
/**
 * Returns the patterns that match the given path.
 * @param patterns The patterns to search through.
 * @param matchPath The path to match against.
 * @returns The patterns that match the given path.
 */
function getMatchingPatterns(patterns, matchPath) {
    return patterns.filter((pattern) => {
        const patternPath = path_1.default.resolve(pattern.matchPath);
        const resolvedMatchPath = path_1.default.resolve(matchPath);
        return resolvedMatchPath.startsWith(patternPath);
    });
}
