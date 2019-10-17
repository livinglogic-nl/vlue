const log = require('../log');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


module.exports = async(name) => {
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
    child_process.execFileSync('yarn', [ 'install' ], { cwd, stdio:'inherit' });

    const url = (file) => path.join(targetDir, file);

    const result = {
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
    }
    return result;
}

