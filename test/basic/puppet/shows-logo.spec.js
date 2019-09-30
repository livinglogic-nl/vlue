
describe('Shows logo', () => {
    it('App shows logo', async({ t, page }) => {
        await page.route();

        const width = await page.evaluate(() => document.querySelector('img').naturalWidth);
        t.equal(width, 220);
    });
});
