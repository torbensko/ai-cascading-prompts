import { PackageJson } from "./getPackageDependencies";


export function packageDependenciesToString(packageJson: PackageJson): string {
  let output = "";

  const convertSection = (
    deps: Record<string, string> | undefined,
    isDev: boolean = false,
  ) => {
    if (!deps || Object.keys(deps).length === 0) return;
    output += isDev ? `Dev packages:` : `Packages:`;
    output += "\n";
    for (const [name, version] of Object.entries(deps)) {
      // console.log(`- ${name} (${version})`);
      output += `- ${name} (${version})\n`;
    }
  };

  convertSection(packageJson.dependencies);
  convertSection(packageJson.devDependencies, true);

  return output;
}
