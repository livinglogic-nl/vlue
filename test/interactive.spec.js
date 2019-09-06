
module.exports = ({ test, vuelStream, launchProject }) => {
    test('Helpful error for src/index.js', async(t) => {
        await launchProject('basic', async(project) => {
            await vuelStream.waitForIdle();

            const cnt = project.get('src/index.js');
            project.remove('src/index.js');

            await vuelStream.waitForError('vuel relies on src/index.js');
            project.add('src/index.js', cnt);
            await vuelStream.waitForIdle();
        });
    });

    test('Helpful error for src/index.html', async(t) => {
        await launchProject('basic', async(project) => {
            await vuelStream.waitForIdle();

            const cnt = project.get('src/index.html');
            project.remove('src/index.html');

            await vuelStream.waitForError('vuel relies on src/index.html');
            project.add('src/index.html', cnt);
            await vuelStream.waitForIdle();
        });
    });
}
