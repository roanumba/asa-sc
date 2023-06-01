const fs = require("fs-extra");

if (fs.existsSync("C:/projects/react/asa/build")) {
    fs.removeSync("C:/xampp/htdocs/asa-aswa");
    fs.copySync("C:/projects/react/asa/build", "C:/xampp/htdocs/asa-aswa");
    fs.copySync("C:/projects/react/asa/src/server", "C:/xampp/htdocs/asa-aswa/server");
}
