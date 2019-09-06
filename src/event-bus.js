const { EventEmitter } = require('events');

class EventBus extends EventEmitter {
    waitFor(name) {
        console.log({
            waiting:name,
        });
        return new Promise(ok => {
        console.log({
            waitingdone:name,
        });
            this.once(name, ok);
        });
    }
}
module.exports = new EventBus;
