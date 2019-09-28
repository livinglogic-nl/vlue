
describe('Mock web request', () => {
    it('App shows result of mocked request', async({ t, page }) => {
        await page.route('axios');

        //initially nothing mocked, so fails
        await page.vclick('button');
        await page.vwait('#error');

        //succeeds with mock
        await page.xhr.push({
            '/api/example': { ok: true },
        });
        await page.vclick('button');
        const result = await page.vtry(() => {
            return document.querySelector('#result').innerText;
        });
        t.equal(result, '{ "ok": true }');


    });
});
