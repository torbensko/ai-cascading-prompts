"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSymbolsFromPrompt = extractSymbolsFromPrompt;
/**
 * Scans a prompt for symbols enclosed in asterisks (*) and returns an array of those symbols.
 *
 * @param prompt
 * @returns
 */
function extractSymbolsFromPrompt(prompt) {
    const symbolRegex = /\*([^\*]+)\*/g;
    const matches = [];
    let match;
    while ((match = symbolRegex.exec(prompt)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
