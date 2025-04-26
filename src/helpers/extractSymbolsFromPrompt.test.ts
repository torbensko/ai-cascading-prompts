import { extractSymbolsFromPrompt } from "./extractSymbolsFromPrompt";

describe('extractSymbolsFromPrompt', () => {
  it('should extract symbols enclosed in asterisks', () => {
    const prompt = 'This is a *test* prompt with *multiple* symbols.';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual(['test', 'multiple']);
  });

  it('should return an empty array if no symbols are found', () => {
    const prompt = 'This is a prompt with no symbols.';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual([]);
  });

  it('should handle prompts with consecutive symbols', () => {
    const prompt = 'This is a *test**example* prompt.';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual(['test', 'example']);
  });

  // it('should handle prompts with nested asterisks correctly', () => {
  //   const prompt = 'This is a *test* with *nested *asterisks* symbols*.';
  //   const result = extractSymbolsFromPrompt(prompt);
  //   expect(result).toEqual(['test', 'nested *asterisks']);
  // });

  it('should handle prompts with symbols at the start and end', () => {
    const prompt = '*start* and end with *symbols*.';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual(['start', 'symbols']);
  });

  it('should handle an empty prompt', () => {
    const prompt = '';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual([]);
  });

  it('should handle prompts with only asterisks and no symbols', () => {
    const prompt = '****';
    const result = extractSymbolsFromPrompt(prompt);
    expect(result).toEqual([]);
  });
});