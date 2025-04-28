"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCamelCase = toCamelCase;
function toCamelCase(text) {
    return text
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()) // capitalize after non-alphanumeric characters
        .replace(/^[A-Z]/, chr => chr.toLowerCase()); // lowercase the first character
}
