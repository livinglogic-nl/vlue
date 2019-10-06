const log = require('./../log');
const fs = require('fs');
const update = require('./update');

const watch = (url, callback) => {
    fs.watch(url, { recursive: true }, (event, file) => {
        callback(event, file);
    });
}

const elapsed = (date,ms) => {
    if(!date) return true;
    return (new Date() - date) > ms;
}

let lastUpdate = null;
let lastUpdateRequest = null;
let filesChanged = new Set;

setInterval(() => {
    if(!lastUpdateRequest) { return; }

    if(elapsed(lastUpdateRequest,200)) {
        lastUpdateRequest = null;
        const filesChangedCopy = [...filesChanged];
        filesChanged.clear();
        update({
            lastUpdate,
            filesChanged:filesChangedCopy,
        });
        lastUpdate = new Date;
    }
},20);

const requestUpdate = () => { lastUpdateRequest = new Date; }
watch('.', (e,file) => {
    if(file.indexOf('.') === 0) { return; }
    if(file.includes('/.')) { return; }
    fs.lstat(file, (e, stats)=> {
        if(!e && stats.isDirectory()) {
            return;
        }
        if(e && e.code === 'ENOENT') {
            log.trace(file, 'removed');
        } else {
            filesChanged.add(file);
            log.trace(file, 'changed');
        }
        requestUpdate();
    });
});

requestUpdate();
