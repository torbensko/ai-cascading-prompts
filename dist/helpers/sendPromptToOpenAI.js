"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPromptToOpenAI = sendPromptToOpenAI;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
/* ------------------------------------------------------------- */
/* 1.  API key – pulled from $OPENAI_API_KEY                     */
/* ------------------------------------------------------------- */
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY – set it in your environment or .env file");
}
const openai = new openai_1.default({ apiKey });
/* ------------------------------------------------------------- */
/* 2.  Chat completion helper                                    */
/* ------------------------------------------------------------- */
async function sendPromptToOpenAI(prompt) {
    /* 2-a ▸ hierarchy for choosing the model
       ───────────────────────────────────────
          1.  model: …           (in the pre-amble)
          2.  $OPENAI_GPT_MODEL_DEFAULT
          3.  "gpt-4o-mini"      (hard fallback)                      */
    const model = prompt.getPreamble().model?.trim() ||
        process.env.OPENAI_GPT_MODEL_DEFAULT ||
        "gpt-4o-mini";
    const fullPrompt = prompt.generateFullPrompt();
    return await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: fullPrompt }],
    });
}
