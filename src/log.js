
const log = (type, message, ...rest) => {
    let obj = {
        type,
        message,
    };
    if(rest.length) {
        obj.details = rest;
    }
    console.log(JSON.stringify(obj)); //, null, 4));
}
module.exports = {
    info(message, ...rest) {
        log('info', message, ...rest);
    },
    error(message, ...rest) {
        log('error', message, ...rest);
    },
    trace(message, ...rest) {
        log('trace', message, ...rest);
    },
}
