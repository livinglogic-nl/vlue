const prepareProject = require('./../src/test/prepare-project');
const { runDev, runBuild } = require('./../src/test/run');

module.exports = ({ test, vuelStream }) => {
    test('Helpful error for src/index.js', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vuelStream) => {
            await vuelStream.waitForIdle();

            const cnt = project.get('src/index.js');
            project.remove('src/index.js');

            await vuelStream.waitForError('vuel relies on src/index.js');
            project.add('src/index.js', cnt);
            await vuelStream.waitForIdle();
        });
    });

    test('Helpful error for src/index.html', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vuelStream) => {
            await vuelStream.waitForIdle();

            const cnt = project.get('src/index.html');
            project.remove('src/index.html');

            await vuelStream.waitForError('vuel relies on src/index.html');
            project.add('src/index.html', cnt);
            await vuelStream.waitForIdle();
        });
    });
}
