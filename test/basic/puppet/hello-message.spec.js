
describe('Hello message', () => {
    it('App shows hello vlue message', async({ t, page }) => {
        await page.route();

        const text = await page.evaluate(() => document.querySelector('#welcome').innerText);
        t.equal(text, 'Hello Vlue!');
    });
});
