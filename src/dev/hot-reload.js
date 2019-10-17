const fs = require('fs');
const path = require('path');
const log = require('../log');
module.exports = {
    install(vendorBundler) {
        const lib = 'vue-hot-reload-api';
        const libPath = path.join('node_modules', lib);
        if(fs.existsSync(libPath)) {
            vendorBundler.add(lib);
        } else {
            log.warn('npm install '+lib + ' to enable hot reloading');
            return;
        }
    },

    async reload(page, sourceBundler) {
        const scripts = sourceBundler.scripts;
        if(scripts.length) {
            const mustRunRoot = scripts.find(entry => entry.updateMethod === undefined);
            const toClear = mustRunRoot ? Object.values(sourceBundler.scriptMap) : scripts;

            //clear old instances
            await page.evaluate((names) => {
                names.forEach(name => {
                    delete vuelInstanced[name];
                });
            }, toClear.map(entry => entry.name));

            const script = sourceBundler.partialScript;
            await page.evaluate(script);

            if(mustRunRoot) {
                log.trace('cold reload');
                await page.evaluate(() => {
                    delete vuelInstanced['vue-hot-reload-api'];
                    vuelImport('src/index.js');
                });
            } else {
                await Promise.all(scripts.map(async(entry) => {
                    log.trace('hot reload', entry.url, entry.updateMethod);
                    return page.evaluate((name, updateMethod) => {
                        const api = vuelImport('vue-hot-reload-api');
                        if(updateMethod === 'vue.rerender') {
                            api.rerender(name, vuelImport(name));
                        } else {
                            api.reload(name, vuelImport(name));
                        }
                    }, entry.name, entry.updateMethod);
                }));
            }
        }
        const styles = sourceBundler.styles;
        if(styles.length) {
            await Promise.all(
                styles.map(s => page.evaluate(({name,code}) => {
                    // console.log('replacing',name);
                    var a = document.querySelector('style[data-name="'+name+'"]');
                    var b = document.createElement('style');
                    b.dataset.name = name;
                    b.innerHTML = code;
                    if(a) {
                        const p = a.parentElement;
                        p.insertBefore(b,a);
                        p.removeChild(a);
                    } else {
                        document.head.appendChild(b);
                    }
                }, s))
            );
        }
    }
}
