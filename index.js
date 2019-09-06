const log = require('./src/log');
const localSettings = require('./src/local-settings');
const chrome = require('./src/chrome');
const handleChanges = require('./src/handle-changes');
const rebuild = require('./src/rebuild');
const server = require('./src/server');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const debounce = require('debounce');

const prepareIndex = require('./src/prepare-index');


const start = async() => {
    process.on('uncaughtException', (reason) => {
        log.error(reason.stack || reason);
    });
    process.on('unhandledRejection', (reason) => {
        log.error(reason.stack || reason);
    });
    localSettings.update();

    let sourcesChanged = [];

    const sourceExtensions = {};

    let index;
    const doUpdate = async(file) => {
        log.info('update');

        const sourcesChangedCopy = sourcesChanged.concat();
        sourcesChanged = [];

        try {
            if(!index || sourcesChangedCopy.includes('src/index.html')) {
                index = prepareIndex();
                server.add('/index.html', index);
            }
            const changes = await rebuild(file, sourceExtensions);
            await handleChanges(changes);
            log.info('idle');
        } catch(e) {
            if(e.file && e.file === 'src/index.js') {
                log.error('vuel relies on src/index.js');
            } else if(e.file && e.file === 'src/index.html') {
                log.error('vuel relies on src/index.html');
            } else {
                throw e;
            }
        }
    }

    let lastUpdate = null;
    let updateId = null;
    const update = (...rest) => {
        let delay = 40;
        if(updateId) {
            clearTimeout(updateId);
        } else {
            if(lastUpdate !== null && (new Date() - lastUpdate) > delay) {
                delay = 40;
            }
        }
        updateId = setTimeout(() => {
            lastUpdate = new Date();
            updateId = null;
            doUpdate(...rest);
        },delay);
    }

    const watchers = [
        chokidar.watch('.vuel-local.js').on('all', (event, path) => {
            localSettings.update();
            update();
        }),

        chokidar.watch('./src').on('all', (event, path) => {
            sourcesChanged.push(path);
            if(event === 'add') {
                sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
            }
            update(path);
        }),
        chokidar.watch('./puppet').on('all', (event, path) => {
            update();
        }),
    ];
    server.start();
};

start();


