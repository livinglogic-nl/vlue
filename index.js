const chrome = require('./src/chrome');
const handleChanges = require('./src/handle-changes');
const rebuild = require('./src/rebuild');
const server = require('./src/server');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const debounce = require('debounce');

const prepareIndex = require('./src/prepare-index');


module.exports = {
    async start() {
        const started = new Date();
        let stopped = null;

        const sourceExtensions = {};
        const update = async(file, forced = false) => {
            const changes = await rebuild(file, sourceExtensions);
            if(!stopped) {
                handleChanges(changes);
            }
        }
        const lazyUpdate = debounce(update,40);
        const realLazyUpdate = () => {
            if(new Date() - started > 1000) {
                lazyUpdate();
            }
        }
        const index = prepareIndex();
        server.add('/index.html', index);

        const watchers = [
            chokidar.watch('.vuel-local.js').on('all', (event, path) => {
                localSettings.update();
                lazyUpdate();
            }),

            chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
                if(event === 'change') {
                    update(path);
                } else if(event === 'add') {
                    sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
                    realLazyUpdate();
                }
            }),
            chokidar.watch('./puppet').on('all', (event, path) => {
                if(event === 'change') {
                    lazyUpdate();
                } else {
                    realLazyUpdate();
                }
            }),
        ];
        server.start();
        lazyUpdate();

        const page = await chrome.getPage();
        return {
            chrome,
            page,
            async stop() {
                stopped = new Date();
                watchers.forEach(watcher => {
                    watcher.close();
                });
                await chrome.stop();
                await server.stop();
            },
        }
    }
};


