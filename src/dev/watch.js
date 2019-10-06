const statWatch = require('./stat-watch');
const log = require('./../log');
const update = require('./update');


let lastUpdate = null;
let lastUpdateRequest = null;
const requestUpdate = () => {
    lastUpdateRequest = new Date;
}

let filesChanged = new Set;

const debounce = () => {
    setImmediate(debounce);
    if(!lastUpdateRequest) { return; }
    if(new Date() - lastUpdateRequest > 200) {
        lastUpdateRequest = null;
        const filesChangedCopy = [...filesChanged];
        filesChanged.clear();
        update({
            lastUpdate,
            filesChanged:filesChangedCopy,
        });
        lastUpdate = new Date;
    }
}
debounce();


const callback = (type, url, stats) => {
    log.trace(url,type);
    if(type === 'changed') {
        if(!stats.isDirectory()) {
            filesChanged.add(url);
        }
    }
    requestUpdate();
}

statWatch([
    'src',
    'puppet',
    'mock',
], 20, callback);
statWatch([ 'node_modules' ], 200, callback, 1);

requestUpdate();

