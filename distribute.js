const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/* ####################################################################### */

// Spinner frames and ANSI color codes for styling console output
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ANSI_COLORS = {
    reset: '\u001b[0m',
    bold: '\u001b[1m',
    white: '\u001b[37m',
    yellow: '\u001b[33m',
    green: '\u001b[32m',
    blue: '\u001b[34m',
    red: '\u001b[91m',
    grey: '\u001b[90m',
};

/* ####################################################################### */

// Define source and target paths
const sourcePath = path.resolve('Apps/shared/output');
const targetPath = [
    path.resolve('Apps/backend/auth-service'),
    path.resolve('Apps/backend/cafe-service'),
    path.resolve('Apps/frontend'),
];

console.log({ sourcePath });
console.log({ targetPath });
console.log(`File to Distribute: ${getLatestFile(sourcePath)}`);

// Start the distribution process
copyLatestFileToTargets(sourcePath, targetPath);

/* ####################################################################### */

// Spinner and checkmark helpers
function startSpinner(text) {
    let i = 0;
    process.stdout.write(
        `${ANSI_COLORS.green}${SPINNER_FRAMES[0]}${ANSI_COLORS.reset} ${ANSI_COLORS.bold}${ANSI_COLORS.white}${text}${ANSI_COLORS.reset}`,
    );
    const interval = setInterval(() => {
        process.stdout.write(
            `\r${ANSI_COLORS.green}${SPINNER_FRAMES[(i = ++i % SPINNER_FRAMES.length)]}${ANSI_COLORS.reset} ${ANSI_COLORS.bold}${ANSI_COLORS.white}${text}${ANSI_COLORS.reset}`,
        );
    }, 80);
    return interval;
}

function stopSpinner(interval, text) {
    clearInterval(interval);
    process.stdout.write(
        `\r${ANSI_COLORS.bold}${ANSI_COLORS.green}✔${ANSI_COLORS.reset} ${ANSI_COLORS.bold}${ANSI_COLORS.yellow}${text}${ANSI_COLORS.reset}\n`,
    );
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

// Main distribution function
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
            `\n${ANSI_COLORS.bold}${ANSI_COLORS.blue}Processing target: ${targetName}${ANSI_COLORS.reset}`,
        );

        const customModulesDir = path.join(targetDir, 'custom_modules');
        let spinner;

        // 1. Unlink the files in the targetDir/custom_modules
        const step1 = `Delete the files in custom_modules: ${targetName}`;
        spinner = startSpinner(step1);
        const filesInCustomModulesDir = await attempt(() =>
            fs.promises.readdir(customModulesDir),
        );
        for (const file of filesInCustomModulesDir || []) {
            await attempt(() =>
                fs.promises.unlink(path.join(customModulesDir, file)),
            );
        }
        stopSpinner(spinner, step1);

        // 2. Remove the targetDir/node_modules dir
        const step2 = `Remove the node_modules directory: ${targetName}`;
        spinner = startSpinner(step2);
        const nodeModulesDir = path.join(targetDir, 'node_modules');
        await attempt(() =>
            fs.promises.rm(nodeModulesDir, { recursive: true, force: true }),
        );
        stopSpinner(spinner, step2);

        // 3. Unlink the targetDir/package-lock.json file
        const step3 = `Delete the package-lock.json file: ${targetName}`;
        spinner = startSpinner(step3);
        const packageLockFilePath = path.join(targetDir, 'package-lock.json');
        await attempt(
            async () => await fs.promises.unlink(packageLockFilePath),
        );
        stopSpinner(spinner, step3);

        // 4. Copy the latestFile into the targetDir/custom_modules dir
        const step4 = `Copy the latest file into custom_modules: ${targetName}`;
        spinner = startSpinner(step4);
        const targetFilePath = path.join(customModulesDir, latestFile);
        await attempt(() =>
            fs.promises.copyFile(sourceFilePath, targetFilePath),
        );
        stopSpinner(spinner, step4);

        // 5. Update the package.json file
        const step5 = `Update the package.json file: ${targetName}`;
        spinner = startSpinner(step5);
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
        stopSpinner(spinner, step5);

        // 6. Run the npm install command
        const step6 = `Run the npm install command: ${targetName}`;
        spinner = startSpinner(step6);
        const npmInstallCmd = `cd ${targetDir} && npm install`;
        await new Promise((resolve, reject) => {
            exec(npmInstallCmd, (error, stdout, stderr) => {
                stopSpinner(spinner, step6);

                if (error) {
                    process.stderr.write(`exec error: ${error}\n`);
                    reject(error);
                    return;
                }

                if (stdout) {
                    process.stdout.write(
                        `${ANSI_COLORS.grey}${stdout}${ANSI_COLORS.reset}`,
                    );
                }

                if (stderr) {
                    process.stderr.write(
                        `${ANSI_COLORS.red}${stderr}${ANSI_COLORS.reset}`,
                    );
                }
                resolve();
            });
        });
    }

    console.log(
        `\n${ANSI_COLORS.bold}${ANSI_COLORS.blue}Distribution process completed.${ANSI_COLORS.reset}`,
    );
}
