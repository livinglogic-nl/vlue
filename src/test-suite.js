const eventBus = require('./event-bus');
const child_process = require('child_process');
const copyRecursive = require('./copy-recursive');
const fs = require('fs');
const path = require('path');

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

    if(1 || !fs.existsSync(path.join(targetDir, 'node_modules'))) {
        child_process.execFileSync('yarn', [ 'install' ]);
    }

    await callback({
        targetDir,
        change(file, handler) {
            const cnt = handler( fs.readFileSync(file).toString() );
            fs.writeFileSync(file, cnt);
        },
        get(file) {
            return fs.readFileSync(file);
        },
        add(file, cnt) {
            fs.writeFileSync(file, cnt);
        },
        remove(file) {
            const url = path.join(targetDir,file);
            fs.unlinkSync(url);
        },
        install(module) {
            child_process.execFileSync('yarn', [ 'add', module ]);
        }
    });

    await new Promise(ok => setTimeout(ok,200));
    process.chdir(originalWorkDir);
}

module.exports = {
    launchProject,
};
