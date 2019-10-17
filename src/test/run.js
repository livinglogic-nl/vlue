const VuelStream = require('../vuel-stream');
const child_process = require('child_process');

let runningDev = null;

const killDev = () => {
    if(runningDev) {
        runningDev.ps.kill('SIGINT');
        runningDev = null;
    }
}

const runDev = async(project, callback) => {
    const { targetDir } = project;
    const vuelIndex = __dirname + '/../../index.js';

    if(!runningDev) {
        const ps = child_process.spawn('node', [ vuelIndex ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
        const stream = new VuelStream(ps);
        runningDev = {
            ps, stream,
        };
    }
    await callback(runningDev.stream);
}
const runBuild = async(project, callback) => {
    killDev();

    const { targetDir } = project;
    const vuelIndex = __dirname + '/../../index.js';
    const ps = child_process.spawn('node', [ vuelIndex, 'build' ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
    const vuelStream = new VuelStream(ps);

    await callback(vuelStream);
}

module.exports = {
    runDev,
    runBuild,
    killDev,
}
