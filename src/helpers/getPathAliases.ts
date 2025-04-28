import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";

export interface PathAlias {
  /** Full alias pattern exactly as it appears in tsconfig, e.g. "@app/*" */
  alias: string;
  /** Portion before the first “*”.  For "@app/*" this is "@app" */
  prefix: string;
  /** Whether the alias contains a wildcard (“*”) */
  wildcard: boolean;
  /** Target globs exactly as listed in tsconfig (might still contain “*”) */
  targets: string[];
  /** Absolute versions of `targets`, resolved relative to baseUrl/project root */
  resolvedTargets: string[];
}

/**
 * Discover **active** path aliases in a tsconfig.json and return them
 * broken down into their constituent parts.
 *
 * @param tsconfigPath  Path to the tsconfig (defaults to "./tsconfig.json").
 * @returns             Array of PathAlias objects.
 */
export function getPathAliases(
  tsconfigPath: string = "tsconfig.json",
): PathAlias[] {
  const absoluteTsConfigPath = path.resolve(tsconfigPath);
  const projectDir = path.dirname(absoluteTsConfigPath);

  // --- 1. load & parse tsconfig (handles “extends”) -------------------------
  const read = ts.readConfigFile(absoluteTsConfigPath, ts.sys.readFile);
  if (read.error) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(
        [read.error],
        {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: ts.sys.getCurrentDirectory,
          getNewLine: () => ts.sys.newLine,
        },
      ),
    );
  }

  const parseResult = ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    projectDir,
  );

  // TODO consider using fileNames for the file paths (rather than listCodebaseFiles)

  const paths = parseResult.options.paths ?? {};
  const aliases: PathAlias[] = [];

  // --- 2. iterate through aliases -------------------------------------------
  for (const [aliasPattern, targetGlobs] of Object.entries(paths)) {
    // Determine if ANY of its targets exist
    const resolved = targetGlobs.map((g) => path.resolve(projectDir, g));
    const isLive = resolved.some((abs) => {
      // Strip trailing globs (“/*”, “*”, “/**”) before testing
      const cleaned = abs.replace(/\*{1,2}$/, "");
      return fs.existsSync(cleaned);
    });

    if (!isLive) continue; // inactive: skip

    const wildcardIndex = aliasPattern.indexOf("*");
    aliases.push({
      alias: aliasPattern,
      prefix:
        wildcardIndex === -1
          ? aliasPattern
          : aliasPattern.slice(0, wildcardIndex),
      wildcard: wildcardIndex !== -1,
      targets: [...targetGlobs],
      resolvedTargets: resolved,
    });
  }

  return aliases;
}

/* -------- Example ----------------------------------
import { getPathAliasObjects } from "./getPathAliasObjects";
console.dir(getPathAliasObjects(), { depth: null });
----------------------------------------------------- */