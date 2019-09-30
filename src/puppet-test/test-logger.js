const log = require('./../log');

const operatorsMap = {
    equal:(obj) => {
        log.result(obj.ok, '"'+obj.actual + '" should equal "'+obj.expected+'"');
    },
    deepEqual:(obj) => {
        const pretty = (obj) => JSON.stringify(obj);
        log.result(obj.ok, pretty(obj.actual) + ' should equal '+pretty(obj.expected));
    },
    error:(obj) => {
        log.error(obj.name);
    },
    ok:(obj) => {
        log.result(obj.ok, obj.name);
    },
}

const map = {
    end:() => {
    },
    test:(obj) => {
        log.info('Running test "' + obj.name+'"');
    },
    assert:(obj) => {
        try {
            operatorsMap[obj.operator](obj);
        } catch(e) {
            console.log(obj.operator);
            throw e;
        }
    },
}

module.exports = (obj) => {
    map[obj.type](obj);
};

