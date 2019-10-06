const localSettings = require('./../local-settings');
const vuelSettings = require('./../vuel-settings');

const removeChanged = require('./remove-changed');
module.exports =  (lastUpdate, filesChanged) => {
    let fullReload = lastUpdate === null;
    let lintAll = lastUpdate === null;
    let updateXHR = lastUpdate === null;
    let build = lastUpdate === null;

    removeChanged(filesChanged, 'vuel.js', () => { vuelSettings.update(); });
    removeChanged(filesChanged, 'vuel.local.js', () => { localSettings.update(); });


    removeChanged(filesChanged, 'eslint.config.js', () => { lintAll = true; });
    removeChanged(filesChanged, 'src/index.html', () => { fullReload = true });
    removeChanged(filesChanged, 'mock/xhr', () => { updateXHR = true });
    if(filesChanged.length > 0) { build = true; }
    return {
        build,
        fullReload,
        updateXHR,
        lintAll,
    };
};
