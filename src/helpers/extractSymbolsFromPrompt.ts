/**
 * Finds symbols wrapped in asterisks (e.g. *UserDTO* or *UserDTO[]*)
 * and returns both the list of symbols and a version of the prompt
 * with those asterisks removed.
 */
export function extractSymbolsFromPrompt(
  prompt: string
): { symbols: string[]; cleanedPrompt: string } {
  const symbolRegex = /\$([a-zA-Z0-9]+)(\[\])?\$/g;

  const symbols: string[] = [];

  // Replace each match with the un-starred text, collecting the symbols as we go.
  const cleanedPrompt = prompt.replace(
    symbolRegex,
    (_match, symbolName: string, arraySuffix: string | undefined) => {
      symbols.push(symbolName);              // store "UserDTO"
      return `${symbolName}${arraySuffix ?? ""}`; // keep "UserDTO[]" if present
    }
  );

  return { symbols, cleanedPrompt };
}