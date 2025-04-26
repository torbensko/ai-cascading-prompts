import { extractSymbolsFromPrompt } from "./extractSymbolsFromPrompt";

describe("extractSymbolsFromPrompt", () => {
  it("extracts symbols enclosed in asterisks and returns a cleaned prompt", () => {
    const prompt =
      "This is a $test$ prompt with $multiple$ symbols.";
    const { symbols, cleanedPrompt } =
      extractSymbolsFromPrompt(prompt);

    expect(symbols).toEqual(["test", "multiple"]);
    expect(cleanedPrompt).toBe(
      "This is a test prompt with multiple symbols."
    );
  });

  it("extracts symbols that include array brackets", () => {
    const prompt =
      "This is a $test[]$ prompt with $multiple[]$ symbols.";
    const { symbols, cleanedPrompt } =
      extractSymbolsFromPrompt(prompt);

    expect(symbols).toEqual(["test", "multiple"]);
    expect(cleanedPrompt).toBe(
      "This is a test[] prompt with multiple[] symbols."
    );
  });

  it("returns an empty array and unchanged prompt if no symbols are found", () => {
    const prompt = "This is a prompt with no symbols.";
    const { symbols, cleanedPrompt } =
      extractSymbolsFromPrompt(prompt);

    expect(symbols).toEqual([]);
    expect(cleanedPrompt).toBe(prompt);
  });

  it("handles symbols at the start and end of the prompt", () => {
    const prompt = "$start$ and end with $symbols$";
    const { symbols, cleanedPrompt } =
      extractSymbolsFromPrompt(prompt);

    expect(symbols).toEqual(["start", "symbols"]);
    expect(cleanedPrompt).toBe(
      "start and end with symbols"
    );
  });

  it("handles an empty prompt", () => {
    const prompt = "";
    const { symbols, cleanedPrompt } =
      extractSymbolsFromPrompt(prompt);

    expect(symbols).toEqual([]);
    expect(cleanedPrompt).toBe("");
  });
});