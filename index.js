#!/usr/bin/env node

const log = require('./src/log');
process.on('uncaughtException', (reason) => {
    log.error(reason.stack || reason);
});
process.on('unhandledRejection', (reason) => {
    log.error(reason.stack || reason);
});



let isDev;
if(process.env.NODE_ENV === undefined) {
    isDev = !process.argv.includes('build');
    process.env.NODE_ENV = isDev ? 'development' : 'production';
} else {
    isDev = process.env.NODE_ENV === 'development';
}

if(!isDev) {
    require('./src/build')();
} else {
    require('./src/dev/index.js');
}



