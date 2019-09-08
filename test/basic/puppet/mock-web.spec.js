
describe('Mock web request', () => {
    it('App shows result of mocked request', async({ t, page }) => {
        await page.route('axios');
        const text = await page.evaluate(() => document.querySelector('#welcome').innerText);
        t.equal(text, 'Hello Vuel!');
    });
});
