#!/usr/bin/env node

const log = require('./src/log');
const vuelSettings = require('./src/vuel-settings');
const localSettings = require('./src/local-settings');
const isDev = !process.argv.includes('build');
process.env.NODE_ENV = isDev ? 'development' : 'production';

process.on('uncaughtException', (reason) => {
    log.error(reason.stack || reason);
});
process.on('unhandledRejection', (reason) => {
    log.error(reason.stack || reason);
});
vuelSettings.update();
localSettings.update();

if(process.argv.includes('build')) {
    require('./src/build')();
} else {
    require('./src/dev')();
}



