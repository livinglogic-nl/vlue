const cluster = require('cluster');


if (cluster.isMaster) {
    require('./master');

    // requestUpdate();

    // for (let i = 0; i < numCPUs; i++) {
    //     cluster.fork();
    // }
    // cluster.on('exit', (worker, code, signal) => {
    //     console.log(`worker ${worker.process.pid} died`);
    // });
} else {
    console.log(`Worker ${process.pid} started`);
    process.on('message', (msg) => {
        if(msg.action === 'update') {
            require('./update')(msg);
        } else {
            console.log({msg});
        }
    });
}


