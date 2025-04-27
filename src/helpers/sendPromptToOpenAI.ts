import OpenAI from "openai";
import "dotenv/config";

import { Prompt } from "../models/Prompt";

/* ------------------------------------------------------------- */
/* 1.  API key – pulled from $OPENAI_API_KEY                     */
/* ------------------------------------------------------------- */
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    "Missing OPENAI_API_KEY – set it in your environment or .env file",
  );
}

const openai = new OpenAI({ apiKey });

/* ------------------------------------------------------------- */
/* 2.  Chat completion helper                                    */
/* ------------------------------------------------------------- */
export async function sendPromptToOpenAI(prompt: string, promptModel?: string) {
  /* 2-a ▸ hierarchy for choosing the model
     ───────────────────────────────────────
        1.  model: …           (in the pre-amble)
        2.  $OPENAI_GPT_MODEL_DEFAULT
        3.  "gpt-4o-mini"      (hard fallback)                      */
  const model =
    promptModel ||
    process.env.OPENAI_GPT_MODEL_DEFAULT ||
    "gpt-4o-mini";

  return await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
}