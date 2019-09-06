const vendorResolver = require('./../src/vendor-resolver');


const testVendorScript = async(t, launchProject, vendor, script) => {
    await launchProject('basic', async(project) => {
        await project.install(vendor);
        const result = vendorResolver(vendor);
        t.equal(result, script, 'Script for '+vendor+' is '+result);
    });
}
module.exports = ({ test, vuelStream, launchProject }) => {
    test('Includes expected script for vue',
        t => testVendorScript(t, launchProject, 'vue', 'dist/vue.common.dev.js'));
    test('Includes expected script for vuex',
        t => testVendorScript(t, launchProject, 'vuex', 'dist/vuex.common.js'));
    test('Includes expected script for vue-router',
        t => testVendorScript(t, launchProject, 'vue-router', 'dist/vue-router.common.js'));
    test('Includes expected script for axios',
        t => testVendorScript(t, launchProject, 'axios', 'dist/axios.js'));
    test('Includes expected script for dayjs',
        t => testVendorScript(t, launchProject, 'dayjs', 'dayjs.min.js'));

}
