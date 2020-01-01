const prepareProject = require('../src/test/prepare-project');
const { runDev, runBuild } = require('../src/test/run');

module.exports = ({ test, vlueStream }) => {
    test('Uses eslint', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vlueStream) => {
            await project.add('eslint.config.js', `
module.exports = {
    parser: 'vue-eslint-parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['vue'],
    extends: [
        'eslint:recommended',
        'plugin:vue/recommended',
    ],
};
`);

            await project.update('src/views/Home.vue', (str) => str);
            await vlueStream.waitForIdle();

        });
    });
    test.only('Changing a source file causes an update', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vlueStream) => {
            await vlueStream.waitForIdle();

            // run puppet test on change:
            await project.update('puppet/hello-message.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            
            // assume the puppet test to pass
            await vlueStream.waitForOk();

            const a = 'Hello Vuel!';
            const b = 'Forced Error.';

            // change to make the puppet test fail
            await project.update('src/views/Home.vue', (str) => str.replace(a,b));
            await vlueStream.waitForFail();


            // change back to make the puppet test pass again
            await project.update('src/views/Home.vue', (str) => str.replace(b,a));
            await vlueStream.waitForOk();
            await vlueStream.waitForIdle();
        });

    });

    test('Allows to mock web requests', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vlueStream) => {
            await vlueStream.waitForIdle();
            await project.update('puppet/mock-web.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            await vlueStream.waitForIdle();
        });
    });

    test('Handles urls in template', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vlueStream) => {
            await vlueStream.waitForIdle();

            await project.update('puppet/shows-logo.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            await vlueStream.waitForOk();
            await vlueStream.waitForIdle();
        });
    });

    test('Handles urls in style', async(t) => {
        const project = await prepareProject('basic');
        await runDev(project, async(vlueStream) => {
            await vlueStream.waitForIdle();

            await project.update('puppet/shows-background.spec.js', (str) => {
                return str.replace(/[\s]it/, 'fit');
            });
            await vlueStream.waitForOk();
            await vlueStream.waitForIdle();
        });
    });
    // test('Uses babel', async(t) => {
    //     const project = await prepareProject('basic');
    //     await runBuild(project, async(vlueStream) => {
    //     });
    // });
}
