import fs from "fs-extra";

const path = '/Applications/MAMP/htdocs';
const project = '.';
const mode = process.argv[2] === 'prod' ? 'prod' : 'dev';
const target = `${path}/${process.argv[3] || 'asa-aswa'}`;

if (fs.existsSync(`${project}/build`)) {
    fs.removeSync(target);
    fs.copySync(`${project}/build`, target);
    fs.copySync(`${project}/src/server`, `${target}/server`);

    // Set APP_ENV=prod in the copied .env
    const envFile = `${target}/server/.env`;
    if (fs.existsSync(envFile)) {
        let envContent = fs.readFileSync(envFile, 'utf8');
        envContent = envContent.replace(/^APP_ENV=.*/m, `APP_ENV=${mode}`);
        fs.writeFileSync(envFile, envContent, 'utf8');
        console.log('APP_ENV set to prod in deployed .env');
    }

    console.log(`Production build copied successfully from ${project}/build to ${target}!`);
}
