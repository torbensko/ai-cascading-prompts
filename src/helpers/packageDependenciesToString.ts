import { PackageJson } from "./getPackageDependencies";


export function packageDependenciesToString(packageJson: PackageJson): string {
  let output = "";

  const convertSection = (
    deps: Record<string, string> | undefined,
    isDev: boolean = false,
  ) => {
    if (!deps || Object.keys(deps).length === 0) return;
    output += `The project uses the following ${isDev ? "dev " : ""}packages:\n`;
    for (const [name, version] of Object.entries(deps)) {
      // console.log(`- ${name} (${version})`);
      output += `- ${name} (${version})\n`;
    }
    output += "\n";
  };

  convertSection(packageJson.dependencies);
  convertSection(packageJson.devDependencies, true);

  return output;
}
