import fs from "fs-extra";

const path = '/Applications/MAMP/htdocs';
const project = '.';
const mode = process.argv[2] === 'prod' ? 'prod' : 'dev';
const target = `${path}/${process.argv[3] || 'asa-aswa'}`;

if (fs.existsSync(`${project}/build`)) {
    fs.removeSync(target);
    fs.copySync(`${project}/build`, target);
    fs.copySync(`${project}/src/server`, `${target}/server`);

    // Deploy correct environment file configuration
    const prodEnvSource = `${project}/src/server/.env.production`;
    const targetEnvFile = `${target}/server/.env`;

    if (mode === 'prod' && fs.existsSync(prodEnvSource)) {
        fs.copySync(prodEnvSource, targetEnvFile);
        console.log('Production .env file deployed with production database credentials.');
    } else {
        if (fs.existsSync(targetEnvFile)) {
            let envContent = fs.readFileSync(targetEnvFile, 'utf8');
            envContent = envContent.replace(/^APP_ENV=.*/m, `APP_ENV=${mode}`);
            fs.writeFileSync(targetEnvFile, envContent, 'utf8');
            console.log(`APP_ENV set to ${mode} in deployed .env`);
        }
    }

    console.log(`Production build copied successfully from ${project}/build to ${target}!`);
}
