const fs = require("fs-extra");
const path='/Applications/MAMP/htdocs'
const project='.'
if (fs.existsSync(`${project}/build`)) {
    fs.removeSync(`${path}/asa-aswa`);
    fs.copySync(`${project}/build`, `${path}/asa-aswa`);
    fs.copySync(`${project}/src/server`, `${path}/asa-aswa/server`);
}
