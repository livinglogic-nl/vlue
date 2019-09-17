const pathToRegexp = require('path-to-regexp');
const header = (name, value) => ({name,value});

module.exports = class PageExtension {
    async init(page) {
        const xhr = this.xhr = [];
        const client = await page.target().createCDPSession();
        await client.send('Fetch.enable');
        client.on('Fetch.requestPaused', (obj) => {
            const { requestId } = obj;
            const { url } = obj.request;
            for(let i=xhr.length-1; i>=0; i--) {
                const entry = xhr[i][url];
                if(entry !== undefined) {
                    const responseCode = 200;
                    const responseHeaders = [
                        header('Access-Control-Allow-Origin', '*'),
                    ];


                    let response;
                    if(entry instanceof Object) {
                        response = entry;
                    } else if(entry instanceof Function) {
                        response = entry();
                    }

                    if(response instanceof Object) {
                        response = JSON.stringify(response);
                    }

                    const body = Buffer.from(response).toString('base64');
                    client.send('Fetch.fulfillRequest', {
                        requestId,
                        responseCode,
                        responseHeaders,
                        body,
                    });
                    return;
                }
            }
            client.send('Fetch.continueRequest', { requestId });
        });
    }

    async route(path = '') {
        const url = 'http://localhost:8080' + '/#/' + path;
        return this.goto(url);
    }


    async pushXHR(obj) {
        this.xhr.push(obj);
    }
}
