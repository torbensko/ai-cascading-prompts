"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageDependenciesToString = packageDependenciesToString;
function packageDependenciesToString(packageJson) {
    let output = "";
    const convertSection = (deps, isDev = false) => {
        if (!deps || Object.keys(deps).length === 0)
            return;
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
