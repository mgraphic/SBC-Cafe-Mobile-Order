const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const GREEN_CHECK = '\u001b[32m✔\u001b[0m';

/* ####################################################################### */

const sourcePath = path.resolve('Apps/shared/output');
const targetPath = [
    path.resolve('Apps/backend/auth-service'),
    path.resolve('Apps/backend/cafe-service'),
    path.resolve('Apps/frontend'),
];

console.log({ sourcePath });
console.log({ targetPath });
console.log(`File to Distribute: ${getLatestFile(sourcePath)}`);

copyLatestFileToTargets(sourcePath, targetPath);

/* ####################################################################### */

// ANSI codes: \u001b[32m = green, \u001b[1m = bold, \u001b[37m = white, \u001b[33m = yellow, \u001b[0m = reset
// Spinner and checkmark helpers
function startSpinner(text) {
    let i = 0;
    const spinnerColor = '\u001b[32m'; // green
    const textColor = '\u001b[1m\u001b[37m'; // bold white
    process.stdout.write(
        `${spinnerColor}${SPINNER_FRAMES[0]} ${textColor}${text}\u001b[0m`,
    );
    const interval = setInterval(() => {
        process.stdout.write(
            `\r${spinnerColor}${SPINNER_FRAMES[(i = ++i % SPINNER_FRAMES.length)]} ${textColor}${text}\u001b[0m`,
        );
    }, 80);
    return interval;
}

function stopSpinner(interval, text) {
    clearInterval(interval);
    const textColor = '\u001b[1m\u001b[33m'; // bold yellow
    process.stdout.write(`\r${textColor}${text}\u001b[0m ${GREEN_CHECK}\n`);
}

// Processing distribution helpers
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
                /sbc-cafe-shared-module-(\d+(?:\.\d+)*).tgz$/,
            );
            return match ? { file, version: match[1] } : null;
        })
        .filter(Boolean);

    return (
        fileVersions
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
            .reverse()[0]?.file || null
    );
}

async function copyLatestFileToTargets(sourceDir, targetDirs) {
    const latestFile = getLatestFile(sourceDir);

    if (!latestFile) {
        console.error('No valid sbc-cafe-shared-module file found.');
        return;
    }

    const sourceFilePath = path.join(sourceDir, latestFile);

    for (const targetDir of targetDirs) {
        const targetName = path.basename(targetDir);
        console.log(`\nProcessing target: ${targetName}`);

        const customModulesDir = path.join(targetDir, 'custom_modules');
        let spinner;

        // 1. Unlink the files in the targetDir/custom_modules
        spinner = startSpinner(
            `Delete the files in custom_modules: ${targetName}`,
        );
        const filesInCustomModulesDir = await attempt(() =>
            fs.promises.readdir(customModulesDir),
        );
        for (const file of filesInCustomModulesDir || []) {
            await attempt(() =>
                fs.promises.unlink(path.join(customModulesDir, file)),
            );
        }
        stopSpinner(
            spinner,
            `Delete the files in custom_modules: ${targetName}`,
        );

        // 2. Remove the targetDir/node_modules dir
        spinner = startSpinner(
            `Remove the node_modules directory: ${targetName}`,
        );
        const nodeModulesDir = path.join(targetDir, 'node_modules');
        await attempt(() =>
            fs.promises.rm(nodeModulesDir, { recursive: true, force: true }),
        );
        stopSpinner(
            spinner,
            `Remove the node_modules directory: ${targetName}`,
        );

        // 3. Unlink the targetDir/package-lock.json file
        spinner = startSpinner(
            `Delete the package-lock.json file: ${targetName}`,
        );
        const packageLockFilePath = path.join(targetDir, 'package-lock.json');
        await attempt(
            async () => await fs.promises.unlink(packageLockFilePath),
        );
        stopSpinner(
            spinner,
            `Delete the package-lock.json file: ${targetName}`,
        );

        // 4. Copy the latestFile into the targetDir/custom_modules dir
        spinner = startSpinner(
            `Copy the latest file into custom_modules: ${targetName}`,
        );
        const targetFilePath = path.join(customModulesDir, latestFile);
        await attempt(() =>
            fs.promises.copyFile(sourceFilePath, targetFilePath),
        );
        stopSpinner(
            spinner,
            `Copy the latest file into custom_modules: ${targetName}`,
        );

        // 5. Update the package.json file
        spinner = startSpinner(`Update the package.json file: ${targetName}`);
        const packageJsonFilePath = path.join(targetDir, 'package.json');
        const packageJson = JSON.parse(
            await fs.promises.readFile(packageJsonFilePath, 'utf-8'),
        );
        packageJson.dependencies['sbc-cafe-shared-module'] =
            `file:custom_modules/${latestFile}`;
        await attempt(() =>
            fs.promises.writeFile(
                packageJsonFilePath,
                JSON.stringify(packageJson, null, 2),
            ),
        );
        stopSpinner(spinner, `Update the package.json file: ${targetName}`);

        // 6. Run the npm install command
        spinner = startSpinner(`Run the npm install command: ${targetName}`);
        const npmInstallCmd = `cd ${targetDir} && npm install`;
        await new Promise((resolve, reject) => {
            exec(npmInstallCmd, (error, stdout, stderr) => {
                stopSpinner(
                    spinner,
                    `Run the npm install command: ${targetName}`,
                );
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                if (stderr) console.error(`stderr: ${stderr}`);
                resolve();
            });
        });
    }

    console.log('\nDistribution process completed.');
}
