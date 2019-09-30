const { runDev, runBuild } = require('./../src/test/run');
const prepareProject = require('./../src/prepare-project');

module.exports = ({ test, vuelStream }) => {
    test('Uses babel', async(t) => {
        const project = await prepareProject('basic');
        await runBuild(project, async(vuelStream) => {
        });
    });
    test('Changing a source file causes an update', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vuelStream) => {
            await vuelStream.waitForIdle();

            // run puppet test on change:
            await project.update('puppet/hello-message.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            
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

    test('Allows to mock web requests', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vuelStream) => {
            await vuelStream.waitForIdle();
            await project.update('puppet/mock-web.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            await vuelStream.waitForIdle();
        });
    });

    test('Handles urls in template', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vuelStream) => {
            await vuelStream.waitForIdle();

            await project.update('puppet/shows-logo.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            await vuelStream.waitForOk();
        });
    });
}
