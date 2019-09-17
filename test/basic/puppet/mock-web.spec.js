
describe('Mock web request', () => {
    it('App shows result of mocked request', async({ t, page }) => {
        await page.route('axios');

        const run = async() => {
            await page.click('button');
            await page.waitFor('#result');
            const text = await page.evaluate(() => document.querySelector('#result').innerText);
            const obj = JSON.parse(text);
            t.ok(obj.week_number !== undefined, 'Response object should include week_number property');
        }

        await run();
        await page.pushXHR({
            'http://worldtimeapi.org/api/timezone/Europe/Amsterdam': { week_number: 1 },
        });

        await run();

    });
});
