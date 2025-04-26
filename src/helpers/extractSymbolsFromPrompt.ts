/**
 * Scans a prompt for symbols enclosed in asterisks (*) and returns an array of those symbols.
 * 
 * @param prompt 
 * @returns 
 */
export function extractSymbolsFromPrompt(prompt: string): string[] {
  const symbolRegex = /\*([^\*]+)\*/g;
  const matches: string[] = [];

  let match;
  while ((match = symbolRegex.exec(prompt)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}
