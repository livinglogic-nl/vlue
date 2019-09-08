
module.exports = ({ test, vuelStream, launchProject }) => {
    test('Changing a source file causes an update', async(t) => {
        await launchProject('basic', async(project) => {
            await vuelStream.waitForIdle();

            // run puppet test on change:
            await project.add('.vuel-local.json', '{ "puppet": "hello-message" }');

            // assume the puppet test to pass
            await vuelStream.waitForOk();

            const a = 'Hello Vuel!';
            const b = 'Forced Error.';

            // change to make the puppet test fail
            await project.update('src/views/Home.vue', (str) => str.replace(a,b));
            await vuelStream.waitForFail();


            // change back to make the puppet test pass again
            await project.update('src/views/Home.vue', (str) => str.replace(b,a));
            await vuelStream.waitForOk();

        });
    });

    test('Changing a puppet file causes that file to be tested', async(t) => {
        await launchProject('basic', async(project) => {
            await vuelStream.waitForIdle();
            await project.update('puppet/hello-message.spec.js', (str) => str);
            await vuelStream.waitForOk();
        });
    });

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

    test('Allows to mock web requests', async(t) => {
        await launchProject('basic', async(project) => {
            await vuelStream.waitForIdle();
            await project.add('.vuel-local.json', '{ "puppet": "mock-web" }');
            await vuelStream.waitForIdle();
        });
    });
}
