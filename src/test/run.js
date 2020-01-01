const VuelStream = require('../vlue-stream');
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
    const vlueIndex = __dirname + '/../../index.js';

    if(!runningDev) {
        const ps = child_process.spawn('node', [ vlueIndex ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
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
    const vlueIndex = __dirname + '/../../index.js';
    const ps = child_process.spawn('node', [ vlueIndex, 'build' ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
    const vlueStream = new VuelStream(ps);

    await callback(vlueStream);
}

module.exports = {
    runDev,
    runBuild,
    killDev,
}
