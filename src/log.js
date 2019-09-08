const chalk = require('chalk');

const emoji = {
    trace: '💭',
    info: '💬',
    error: '🔴',
    ok: '✅',
    fail: '❌',

}
const log = (type, ...rest) => {
    const d = new Date();
    const az = (nr) => nr < 10 ? '0'+nr : ''+nr;
    const time = [
        az(d.getHours()),
        az(d.getMinutes()),
        az(d.getSeconds()),
    ].join(':');

    console.log(emoji[type], rest.join(' '));
}
module.exports = {
    emoji,
    info(message, ...rest) {
        log('info', message, ...rest);
    },
    error(message, ...rest) {
        log('error', message, ...rest);
    },
    trace(message, ...rest) {
        log('trace', message, ...rest);
    },
    result(ok, message, ...rest) {
        log(ok ? 'ok' : 'fail', message, ...rest);
    },
    ok(message, ...rest) {
        log('ok', message, ...rest);
    },
    fail(message, ...rest) {
        log('fail', message, ...rest);
    },
}
