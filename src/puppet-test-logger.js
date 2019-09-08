const log = require('./log');

const operatorsMap = {
    equal:(obj) => {
        if(obj.ok) {
            log.ok('"'+obj.actual + '" equals expected "'+obj.expected+'"');
        } else {
            log.fail('"'+obj.actual + '" does not equal expected "'+obj.expected+'"');
        }
    },
    error:(obj) => {
        log.error(obj.name);
    },
}

const map = {
    end:() => {
    },
    test:(obj) => {
        log.info('Running test "' + obj.name+'"');
    },
    assert:(obj) => {
        operatorsMap[obj.operator](obj);
    },
}

module.exports = (obj) => {
    map[obj.type](obj);
};

