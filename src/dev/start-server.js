const vuelSettings = require('./../vuel-settings');
const prepareIndex = require('./../prepare-index');
const server = require('./../server');
module.exports = (sourceBundler, vendorBundler) => {
    server.addCallback('/index.html', () => {
        return prepareIndex({ isDev:true, sourceBundler, vendorScript:vendorBundler.fullScript });
    });
    server.addCallback('/index.js', () => {
        return sourceBundler.fullScript;
    });
    server.start(vuelSettings.port);
    return server;
}
