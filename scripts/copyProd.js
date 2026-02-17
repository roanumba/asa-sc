import fs from "fs-extra";

const path = '/Applications/MAMP/htdocs';
const project = '.';
// passed as an argument to the script, e.g. `node copyProd.js <root-page>` defalts to `asa-aswa`
const target = `${path}/${process.argv[2] || 'asa-aswa'}`;

if (fs.existsSync(`${project}/build`)) {
    fs.removeSync(target);
    fs.copySync(`${project}/build`, target);
    fs.copySync(`${project}/src/server`, `${target}/server`);
    //log completion message
    console.log(`Production build copied successfully from ${project}/build to ${target}!`);
}
