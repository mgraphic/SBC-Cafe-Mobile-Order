const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const sourcePath = path.resolve('Apps/shared/output');
const targetPath = [
    path.resolve('Apps/backend/auth-service'),
    path.resolve('Apps/backend/cafe-service'),
    path.resolve('Apps/frontend'),
];

console.log({ sourcePath });
console.log({ targetPath });
console.log(`File to Distribute: ${getLatestFile(sourcePath)}`);

function attempt(fn) {
    try {
        return fn();
    } catch (error) {
        console.error(`Error in function ${fn.name}:`, error);
    }
}

function getLatestFile(sourceDir) {
    const files = fs.readdirSync(sourceDir);
    const fileVersions = files
        .map((file) => {
            const match = file.match(
                /sbc-cafe-shared-module-(\d+(?:\.\d+)*).tgz$/
            );
            return match ? { file, version: match[1] } : null;
        })
        .filter(Boolean);

    return fileVersions
        .sort((a, b) => {
            const aVersion = a.version.split('.').map(Number);
            const bVersion = b.version.split('.').map(Number);

            while (aVersion.length < bVersion.length) aVersion.push(0);
            while (bVersion.length < aVersion.length) bVersion.push(0);

            for (let i = 0; i < aVersion.length; i++) {
                if (aVersion[i] < bVersion[i]) return -1;
                if (aVersion[i] > bVersion[i]) return 1;
            }

            return 0;
        })
        .reverse()[0].file;
}

function copyLatestFileToTargets(sourceDir, targetDirs) {
    const latestFile = getLatestFile(sourceDir);
    const sourceFilePath = path.join(sourceDir, latestFile);

    targetDirs.forEach((targetDir) => {
        const customModulesDir = path.join(targetDir, 'custom_modules');

        // 1. Unlink the files in the targetDir/custom_modules
        const filesInCustomModulesDir = attempt(() =>
            fs.readdirSync(customModulesDir)
        );
        filesInCustomModulesDir?.forEach((file) =>
            attempt(() => fs.unlinkSync(path.join(customModulesDir, file)))
        );

        // 2. Remove the targetDir/node_modules dir
        const nodeModulesDir = path.join(targetDir, 'node_modules');
        attempt(() => fs.rmdirSync(nodeModulesDir, { recursive: true }));

        // 3. Unlink the targetDir/package-lock.json file
        const packageLockFilePath = path.join(targetDir, 'package-lock.json');
        attempt(() => fs.unlinkSync(packageLockFilePath));

        // 4. Copy the latestFile into the targetDir/custom_modules dir
        const targetFilePath = path.join(customModulesDir, latestFile);
        attempt(() => fs.copyFileSync(sourceFilePath, targetFilePath));

        // 5. Update the package.json file
        const packageJsonFilePath = path.join(targetDir, 'package.json');
        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonFilePath, 'utf-8')
        );
        packageJson.dependencies[
            'sbc-cafe-shared-module'
        ] = `file:custom_modules/${latestFile}`;
        attempt(() =>
            fs.writeFileSync(
                packageJsonFilePath,
                JSON.stringify(packageJson, null, 2)
            )
        );

        // 6. Run the npm install command
        const npmInstallCmd = `cd ${targetDir} && npm install`;
        exec(npmInstallCmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    });
}

copyLatestFileToTargets(sourcePath, targetPath);
