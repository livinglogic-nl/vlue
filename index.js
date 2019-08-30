const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const debounce = require('debounce');

const localSettings = require('./local-settings');
const handleChanges = require('./handle-changes');
const rebuild = require('./rebuild');
const server = require('./server');
const prepareIndex = require('./prepare-index');
const chrome = require('./chrome');

const sourceExtensions = {};


const update = async(file, forced = false) => {
    const changes = await rebuild(file, sourceExtensions);
    handleChanges(changes);
}

const index = prepareIndex();
server.add('/index.html', index);


const lazyUpdate = debounce(update,40);
chokidar.watch('.vuel-local.js').on('all', (event, path) => {
    localSettings.update();
    lazyUpdate();
});

chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    if(event === 'change') {
        update(path);
    } else if(event === 'add') {
        sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
        lazyUpdate();
    }
});
chokidar.watch('./puppet').on('all', (event, path) => {
    lazyUpdate();
});
server.start();
