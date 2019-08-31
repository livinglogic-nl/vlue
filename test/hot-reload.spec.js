const { test, launchVuel } = require('../src/test-suite');

test('changing component script reloads that component', async(t) => {
    await launchVuel('basic', async(context) => {
        const { page, chrome, project } = context;

        const before = await page.evaluate(() => document.querySelector('#app').innerText);
        t.equal(before, 'Hello Vuel!');

        await project.change('src/App.vue', (str) => str.replace(/Hello/g, 'You go'));
        await chrome.waitForUpdate();

        const after = await page.evaluate(() => document.querySelector('#app').innerText);
        t.equal(after, 'You go Vuel!');
    });
});

test('changing css reloads css', async(t) => {
    await launchVuel('basic', async(context) => {
        const { page, chrome, project } = context;

        const before = await page.evaluate(() => getComputedStyle(document.body).display);
        t.equal(before, 'block');

        await project.change('src/App.vue', (str) => str.replace('display: block', 'display: flex'));
        await chrome.waitForUpdate();

        const after = await page.evaluate(() => getComputedStyle(document.body).display);
        t.equal(after, 'flex');
    });
});



