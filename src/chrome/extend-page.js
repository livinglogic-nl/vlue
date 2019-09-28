const PageExtension = require('./page-extension');

module.exports = async(page) => {
    const extended = new PageExtension(page);
    await extended.init(page);

    const settings = {
        interval: 0,
    };
    extended.setInterval = (to) => {
        settings.interval = to;
    }


    extended.mouse = new Proxy(page.mouse, {
        get(obj,key) {
            const val = obj[key];
            if(typeof(val) !== 'function') {
                return val;
            }
            return (...rest) => {
                return new Promise(async(ok) => {
                    const result = await val.bind(obj)(...rest);
                    setTimeout(() => {
                        ok(result);
                    },settings.interval);
                });
            };
        },
    });

    return new Proxy(page, {
        get(obj,key) {
            const val = extended[key] || page[key];
            if(typeof(val) !== 'function') {
                return val;
            }
            return (...rest) => {
                return new Promise(async(ok) => {
                    const result = await val.bind(obj)(...rest);
                    setTimeout(() => {
                        ok(result);
                    },settings.interval);
                });
            };
        },
    });
}

