
let config = {};
module.exports = {
    update() {
        try {
            const full = require.resolve(process.cwd() + '/.vuel-local');
            delete require.cache[full];
            config = require(full);
        } catch(e) {
        }
    },

    get reload() {
        return config.reload || 'hot';
    },
};
