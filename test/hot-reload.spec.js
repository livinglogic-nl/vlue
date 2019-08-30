const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('blue-tape');
const copyRecursive = require('./../src/copy-recursive');


const prepareProject = (name) => {

    const sourceDir = path.join('test', name);
    const targetDir = '/tmp/vuel-test';
    // child_process.execSync('rm -rf '+targetDir);
    if(!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
        copyRecursive(sourceDir, targetDir);
    }

    const cwd = targetDir;
    if(!fs.existsSync(path.join(targetDir, 'node_modules'))) {
        child_process.execFileSync('yarn', [ 'install' ], { cwd });
        child_process.execFileSync('npm', [ 'link', 'vuel' ], { cwd, stdio:'inherit' });
    }
    return {
        sourceDir,
        targetDir,
    };
}

const launchVuel = async(project) => {

}

test('changing component script reloads that component', async() => {
    const project = await prepareProject('basic');
    const context = await launchVuel(project);

    const { page } = context;

    const before = await page.evaluate(() => document.querySelector('#app').innerText);
    console.log(before);

    project.change('src/App.vue', (str) => str.replace('hello', 'bye'));
    const after = await page.evaluate(() => document.querySelector('#app').innerText);

    console.log(after);
});
test('changing css reloads css', async() => {
    console.log(2);
});



