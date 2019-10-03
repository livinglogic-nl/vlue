
const { performance } = require('perf_hooks');
const map = {};
module.exports = {
    start(label) {
        map[label] = performance.now();
    },
    end(label) {
        let then = map[label];
        if(then) {
            delete map[label];
            return Math.round(performance.now() - then);
        }
        throw Error('Non started label '+label);
    },
}
