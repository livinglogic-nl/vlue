const copyRecursive = require('./copy-recursive');
const fs = require('fs');
const path = require('path');
const test = require('blue-tape');

const vuel = require('..');

const launchProject = async(name, callback) => {
    const sourceDir = path.join('test', name);
    const targetDir = '/tmp/vuel-test';
    // child_process.execSync('rm -rf '+targetDir);
    if(!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    copyRecursive(sourceDir, targetDir);

    const originalWorkDir = process.cwd();
    process.chdir(targetDir);

    if(!fs.existsSync(path.join(targetDir, 'node_modules'))) {
        child_process.execFileSync('yarn', [ 'install' ]);
        child_process.execFileSync('npm', [ 'link', 'vuel' ], { stdio:'inherit' });
    }

    await callback({
        targetDir,
        change(file, handler) {
            const cnt = handler( fs.readFileSync(file).toString() );
            fs.writeFileSync(file, cnt);
        },
    });

    process.chdir(originalWorkDir);
}

const launchVuel = async(projectDir, callback) => {
    await launchProject(projectDir, async(project) => {
        let context = await vuel.start({
            cwd: project.targetDir,
        });
        context.project = project;
        await context.chrome.waitForUpdate();

        await callback(context);
        await context.stop();
    });

}

module.exports = {
    test,
    launchVuel,
};
