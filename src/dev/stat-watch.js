const fs = require('fs');
const { performance } = require('perf_hooks');
const map = {};
module.exports = (arr, interval, callback, maxDepth = 999) => {
    const pass = async(arr, depth = 0) => {
        arr.map(url => new Promise(async(ok) => {
            fs.stat(url, async(e, stats) => {
                if(e) { 
                    if(map[url]) {
                        delete map[url];
                        console.log(e);
                        callback('removed', url);
                    }
                    return;
                }
                const { mtimeMs } = stats;
                let obj = map[url];
                if(!obj) {
                    obj = map[url] = {};
                }
                if(obj.mtimeMs !== mtimeMs) {
                    if(obj.mtimeMs !== undefined) {
                        callback('changed', url, stats);
                    }
                    obj.mtimeMs = mtimeMs;
                    if(depth < maxDepth && stats.isDirectory()) {
                        fs.readdir(url, (e, files) => {
                            obj.files = files.map(f => url + '/' + f);
                        });
                    }
                }
                if(depth < maxDepth && obj.files) {
                    await pass(obj.files, depth + 1);
                }
                ok();
            });
        }));
    }

    const loop = async() => {
        const before = performance.now();
        await pass(arr);
        const elapsed = performance.now() - before;

        const delay = Math.max(10, interval - elapsed);
        setTimeout(loop, delay);
    }
    loop();
}
