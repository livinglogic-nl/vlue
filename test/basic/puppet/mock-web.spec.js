
describe('Mock web request', () => {
    it('App shows result of mocked request', async({ t, page }) => {
        await page.route('axios');
        await page.waitFor('#result');
        const text = await page.evaluate(() => document.querySelector('#result').innerText);
        const obj = JSON.parse(text);
        t.ok(obj.week_number !== undefined, 'Response object should include week_number property');
    });
});
