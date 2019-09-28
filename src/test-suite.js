const log = require('./log');
const child_process = require('child_process');
const copyRecursive = require('./copy-recursive');
const fs = require('fs');
const path = require('path');

const launchProject = async(name, callback) => {
    const sourceDir = path.join('test', name) + '/';
    const targetDir = '/tmp/vuel-test';

    child_process.execFileSync('rsync', [
        '-av',
        sourceDir,
        targetDir,
        '--exclude', 'node_modules',
        '--exclude', 'yarn.lock',
        '--delete',
    ], { stdio:'inherit' });
    


    const cwd = targetDir;
    log.info('yarn installing', targetDir);
    child_process.execFileSync('yarn', [ 'install' ], { cwd, stdio:'inherit' });

    const url = (file) => path.join(targetDir, file);
    await callback({
        targetDir,
        update(file, handler) {
            const cnt = handler( fs.readFileSync(url(file)).toString() );
            fs.writeFileSync(url(file), cnt);
        },
        get(file) {
            return fs.readFileSync(url(file));
        },
        add(file, cnt) {
            fs.writeFileSync(url(file), cnt);
        },
        remove(file) {
            fs.unlinkSync(url(file));
        },
        install(module) {
            child_process.execFileSync('yarn', [ 'add', module ], { cwd });
        }
    });
}

module.exports = {
    launchProject,
};
