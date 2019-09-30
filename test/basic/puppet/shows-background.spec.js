describe('Shows background', () => {
    it('App shows background', async({ t, page }) => {
        await page.route('');

        const color = await page.vcolor(1,1);
        t.deepEqual(color, {
            red: 250,
            green: 250,
            blue: 250,
            alpha: 255,
        });
    });
});
