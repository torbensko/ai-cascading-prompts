import path from "path";
import { PromptPattern } from "./loadPromptPatterns";

/**
 * Returns the patterns that match the given path.
 * @param patterns The patterns to search through.
 * @param matchPath The path to match against.
 * @returns The patterns that match the given path.
 */

export function getMatchingPatterns(
  patterns: PromptPattern[],
  matchPath: string
): PromptPattern[] {
  return patterns.filter((pattern) => {
    const patternPath = path.resolve(pattern.matchPath);
    const resolvedMatchPath = path.resolve(matchPath);
    return resolvedMatchPath.startsWith(patternPath);
  });
}
