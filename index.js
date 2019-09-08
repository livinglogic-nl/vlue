const puppetTest = require('./src/puppet-test');
const watch = require('./src/watch');
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

    let filesChanged = [];
    let index;
    const doUpdate = async() => {
        log.info('update');
        const changed = filesChanged.concat();
        filesChanged = [];

        let file = null;
        if(changed.length === 1) {
            file = changed[0];
        }
        try {
            if(!index || changed.includes('src/index.html')) {
                index = prepareIndex();
                server.add('/index.html', index);
            }

            const changes = await rebuild(file, {});
            const updatePromise = chrome.waitForUpdate();
            await handleChanges(changes);

            let puppetFile = null;
            if(file && file.indexOf('puppet') === 0) {
                puppetFile = path.join(process.cwd(), file);
            } else {
                const { puppet } = localSettings;
                if(puppet) {
                    puppetFile = path.join(process.cwd(), 'puppet', puppet + '.spec.js');
                    if(!fs.existsSync(puppetFile)) {
                        throw Error('Puppet script ' + puppetFile + ' does not exist');
                    }
                }
            }

            if(puppetFile) {
                await updatePromise;
                await puppetTest.runTests( [ puppetFile ] );
            }
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

    const elapsed = (date,ms) => {
        if(!date) return true;
        return (new Date() - date) > ms;
    }

    let lastUpdate = null;
    let lastUpdateRequest = null;
    setInterval(() => {
        if(!lastUpdateRequest) {
            return;
        }
        if(elapsed(lastUpdateRequest,200)) {
            lastUpdateRequest = null;
            lastUpdate = new Date;
            doUpdate();
        }
    },100);

    const update = () => {
        lastUpdateRequest = new Date;
    }

    const dirs = fs.readdirSync('.');
    watch('.', (e,file) => {
        log.trace('💾', file);
        if(file === '.vuel-local.json') {
            localSettings.update();
        }
        filesChanged.push(file);
        update();
    });

    server.start();
    update();
};

start();


