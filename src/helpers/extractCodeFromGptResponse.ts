/**
 * This function extracts any codeblocks from the input text.
 * The block will always start and end with ```.
 * @param textFromGpt string
 * @returns string
 */
export function extractCodeFromGptResponse(textFromGpt: string): string {
  const matched = textFromGpt.match(/```[\s\S]*?```/g);
  if (!matched) throw new Error("No code blocks found in the response.");
  return matched
    .map((codeBlock) => {
      return codeBlock
        .replace(/```[\w\s]*\n/g, "") // remove the opening tag
        .replace(/\n```/g, ""); // remove the closing tag
    })
    .join("\n\n");
}
