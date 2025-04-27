import { promises as fs } from "fs";
import * as path from "path";

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Reads package.json (or a custom path) and logs the dependencies
 * in a human-friendly format.
 *
 * @param packageJsonPath  Full path to package.json.
 *                         Defaults to "<cwd>/package.json".
 */
export async function getPackageDependencies(
  packageJsonPath: string = path.resolve(process.cwd(), "package.json"),
): Promise<PackageJson> {
  // 1. Load and parse package.json
  const raw = await fs.readFile(packageJsonPath, "utf8");
  const pkg: PackageJson = JSON.parse(raw);
  return pkg;
}

