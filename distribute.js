const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const GREEN_CHECK = '\u001b[1m\u001b[32m✔\u001b[0m';

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
    process.stdout.write(`\r${GREEN_CHECK} ${textColor}${text}\u001b[0m\n`);
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
        console.log(
            `\n\u001b[1m\u001b[34mProcessing target: ${targetName}\u001b[0m`,
        );

        const customModulesDir = path.join(targetDir, 'custom_modules');
        let spinner;
        let step;

        // 1. Unlink the files in the targetDir/custom_modules
        step = `Delete the files in custom_modules: ${targetName}`;
        spinner = startSpinner(step);
        const filesInCustomModulesDir = await attempt(() =>
            fs.promises.readdir(customModulesDir),
        );
        for (const file of filesInCustomModulesDir || []) {
            await attempt(() =>
                fs.promises.unlink(path.join(customModulesDir, file)),
            );
        }
        stopSpinner(spinner, step);

        // 2. Remove the targetDir/node_modules dir
        step = `Remove the node_modules directory: ${targetName}`;
        spinner = startSpinner(step);
        const nodeModulesDir = path.join(targetDir, 'node_modules');
        await attempt(() =>
            fs.promises.rm(nodeModulesDir, { recursive: true, force: true }),
        );
        stopSpinner(spinner, step);

        // 3. Unlink the targetDir/package-lock.json file
        step = `Delete the package-lock.json file: ${targetName}`;
        spinner = startSpinner(step);
        const packageLockFilePath = path.join(targetDir, 'package-lock.json');
        await attempt(
            async () => await fs.promises.unlink(packageLockFilePath),
        );
        stopSpinner(spinner, step);

        // 4. Copy the latestFile into the targetDir/custom_modules dir
        step = `Copy the latest file into custom_modules: ${targetName}`;
        spinner = startSpinner(step);
        const targetFilePath = path.join(customModulesDir, latestFile);
        await attempt(() =>
            fs.promises.copyFile(sourceFilePath, targetFilePath),
        );
        stopSpinner(spinner, step);

        // 5. Update the package.json file
        step = `Update the package.json file: ${targetName}`;
        spinner = startSpinner(step);
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
        stopSpinner(spinner, step);

        // 6. Run the npm install command
        step = `Run the npm install command: ${targetName}`;
        spinner = startSpinner(step);
        const npmInstallCmd = `cd ${targetDir} && npm install`;
        await new Promise((resolve, reject) => {
            exec(npmInstallCmd, (error, stdout, stderr) => {
                stopSpinner(spinner, step);
                if (error) {
                    process.stderr.write(`exec error: ${error}\n`);
                    reject(error);
                    return;
                }
                // Muted grey for stdout, muted red for stderr
                const grey = '\u001b[90m'; // Bright black (muted grey)
                const red = '\u001b[91m'; // Bright red (muted red)
                const reset = '\u001b[0m';
                if (stdout) process.stdout.write(`${grey}${stdout}${reset}`);
                if (stderr) process.stderr.write(`${red}${stderr}${reset}`);
                resolve();
            });
        });
    }

    console.log(
        '\n\u001b[1m\u001b[34mDistribution process completed.\u001b[0m',
    );
}
