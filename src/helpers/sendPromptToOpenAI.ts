import OpenAI from "openai";
import { Prompt } from "../models/Prompt";

const openai = new OpenAI();

/**
 * Send the fully-assembled prompt to OpenAI.
 *
 * • If the prompt’s pre-amble contains a `model:` key (e.g. `model: 3o`)
 *   that model name is used.  
 * • Otherwise `gpt-4o-mini` is the default.
 */
export async function sendPromptToOpenAI(
  prompt: Prompt,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  // extractor helper – you can also expose a getter on Prompt instead
  const modelFromPreamble = (prompt as any).preamble?.model as string | undefined;
  const model = modelFromPreamble?.trim() || "gpt-4o";

  const fullPrompt = prompt.generateFullPrompt();

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: fullPrompt,
      },
    ],
  });

  return completion;
}