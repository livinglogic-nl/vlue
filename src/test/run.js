const VuelStream = require('./../vuel-stream');
const child_process = require('child_process');

const runDev = async(project, callback) => {
    const { targetDir } = project;
    const vuelIndex = __dirname + '/../../index.js';
    const ps = child_process.spawn('node', [ vuelIndex ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
    const vuelStream = new VuelStream(ps);

    await callback(vuelStream);
    ps.kill('SIGINT');
}
const runBuild = async(project, callback) => {
    const { targetDir } = project;
    const vuelIndex = __dirname + '/../../index.js';
    const ps = child_process.spawn('node', [ vuelIndex, 'build' ], { cwd:targetDir, stdio: ['inherit', 'pipe', 'pipe'] });
    const vuelStream = new VuelStream(ps);

    await callback(vuelStream);
}

module.exports = {
    runDev,
    runBuild,
}
