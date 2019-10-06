const startServer = require('./start-server');
const gatherActions = require('./gather-actions');
const hotReload = require('./hot-reload');

const chrome = require('./../chrome');
const rebuild = require('./../rebuild');
const time = require('./../time');
const puppetTest = require('./../puppet-test');

const statWatch = require('./stat-watch');
const log = require('./../log');

const vendorBundler = require('../vendor-bundler')();
const sourceBundler = require('../source-bundler')(true);

const server = startServer(sourceBundler, vendorBundler);

let lastUpdate = null;
let lastUpdateRequest = null;
const requestUpdate = () => { lastUpdateRequest = new Date; }

let filesChangedSet = new Set;
const debounce = async() => {
    setImmediate(debounce);
    if(!lastUpdateRequest) { return; }
    if(new Date() - lastUpdateRequest < 200) { return; }

    lastUpdateRequest = null;
    time.start('update');

    const filesChanged = [...filesChangedSet];
    filesChangedSet.clear();

    const actions = gatherActions(lastUpdate, filesChanged);
    if(actions.build) {
        await rebuild({ filesChanged, sourceBundler, vendorBundler });
        if(vendorBundler.changed()) {
            hotReload.install(vendorBundler);
            server.add('/vendor.js', [
                vendorBundler.supportScript,
                vendorBundler.fullScript
            ].join('\n'));
            fullReload = true;
        }
    }

    const page = await chrome.getPage();
    if(actions.updateXHR) { page.xhr.reset(); }
    if(actions.fullReload) {
        await page.reload();
    } else {
        if(sourceBundler.scripts.length || sourceBundler.styles.length) {
            await hotReload.reload(page, sourceBundler);
        }
    }
    const updatedms = time.end('update');
    log.info('updated in '+updatedms+'ms');
    lastUpdate = new Date;

    await puppetTest.runDev(filesChanged);
    // await linter.lint({
    //     filesChanged,
    //     sourceBundler,
    //     lintAll,
    //     fix: true,
    //     fix: false,
    // });

    log.info('idle');
}
debounce();

const onFileChange = (type, url, stats) => {
    log.trace(url,type);
    if(type === 'changed') {
        if(!stats.isDirectory()) {
            filesChangedSet.add(url);
        }
    }
    requestUpdate();
}

statWatch([
    'src',
    'puppet',
    'mock',
], 20, onFileChange);
statWatch([ 'node_modules' ], 200, onFileChange, 1);

requestUpdate();

