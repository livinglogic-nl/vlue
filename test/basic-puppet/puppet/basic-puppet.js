
describe('Basic puppet', () => {
    it('Gets the hello puppet message', async({ t, page }) => {
        await page.goto('http://localhost:8080/#/');
        const text = await page.evaluate(() => document.querySelector('#app').innerText);
        t.equal(text, 'Hello puppet!');
    });
});
