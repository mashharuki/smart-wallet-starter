// eslint-disable-next-line
const fs = require('fs');
// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const { execSync } = require('child_process');

const updatePackageJson = (packageJson) => {
    fs.writeFileSync(
        path.join(__dirname, '..', '..', 'package.json'),
        `${JSON.stringify(packageJson, null, 2)}\n`,
    );
};

const main = async () => {
    const args = process.argv.slice(2);
    const type = args[0];

    const packageJson = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', '..', 'package.json'),
            'utf8',
        ),
    );

    const oldVersion = packageJson.version;
    const versionParts = oldVersion.split('.');

    if (type === 'patch') {
        versionParts[2] = parseInt(versionParts[2]) + 1;
    } else if (type === 'minor') {
        versionParts[1] = parseInt(versionParts[1]) + 1;
        versionParts[2] = 0;
    } else if (type === 'major') {
        versionParts[0] = parseInt(versionParts[0]) + 1;
        versionParts[1] = 0;
        versionParts[2] = 0;
    } else {
        throw new Error('Invalid type');
    }

    const newVersion = versionParts.join('.');
    packageJson.version = newVersion;
    packageJson.main = 'dist/index.js';
    packageJson.types = 'dist/index.d.ts';

    updatePackageJson(packageJson, newVersion);

    console.log(`Publishing ${newVersion}...`);
    execSync(`npm publish --access=public`);

    packageJson.main = 'src/index.ts';
    packageJson.types = 'src/index.ts';

    updatePackageJson(packageJson, newVersion);
};

main();
