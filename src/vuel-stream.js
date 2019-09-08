const { emoji } = require('./log');

module.exports = class VuelStream {
    constructor(ps) {
        const types = {};
        Object.entries(emoji).forEach(([key,val]) => {
            types[val.codePointAt(0)] = key;
        });

        this.queue = [];

        let buffer = '';
        let tries = 0;
        ps.stdout.on('data', (buf) => {
            buffer += buf.toString();
            
            let lastIndex = -1;
            while(1) {
                let idx = buffer.indexOf('\n', lastIndex+1);
                if(idx !== -1) {
                    idx++;

                    const str = buffer.substr(0,idx).trim();
                    console.log(str);
                    buffer = buffer.substr(idx);

                    const obj = {
                        type: types[str.codePointAt(0)],
                        message: str.substr(3),
                    };
                    this.queue.push(obj);
                    this.tryDeliver();
                    lastIndex = -1;
                } else {
                    break;
                }
            }
        });
        ps.stderr.on('data', (buf) => {
            process.stdout.write(buf);
        });

        ps.on('error', e => {
            console.log({e});
        });
        ps.on('close', exitCode => {
            console.log({exitCode});
        });
    }

    waitForIdle() {
        return this.messagePromise(({message}) => message === 'idle');
    }
    waitForOk() {
        return this.messagePromise(({type}) => type === 'ok');
    }
    waitForFail() {
        return this.messagePromise(({type}) => type === 'fail');
    }

    waitForError(errorMessage) { 
        return this.messagePromise(({type,message}) => type === 'error' && message === errorMessage);
    }
    messagePromise(callback) {
        const p =  new Promise(ok => {
            this.queueConsumer = {
                callback,
                ok,
            };
            this.tryDeliver();
        });

        return p;
    }

    tryDeliver() {
        const { queue, queueConsumer } = this;
        if(!queueConsumer) { return; }
        const { callback, ok } = queueConsumer;
        for(let i=0; i<queue.length; i++) {
            if(callback(queue[i])) {
                this.queueConsumer = null;
                this.queue.splice(0,i+1);
                ok();
                return;
            }
        }
    }

}
