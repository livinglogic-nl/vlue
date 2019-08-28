const child_process = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const copyRecursive = require('./copy-recursive');

const testDir = 'test';
const testRootDir = 'test-root';
const testRootModules = path.join(testRootDir, 'node_modules');

const cwd = testRootDir;

const yarnInstall = () => {
    child_process.execFileSync('yarn', [ 'install' ], { cwd });
}


const linkVuel = () => {
    child_process.execFileSync('npm', [ 'link', 'vuel' ], { cwd });
}

const loadDeps = (dir) => {
    const url = path.join(dir, 'deps.json');
    try {
        return JSON.parse( fs.readFileSync(url) );
    } catch(e) {
        return [];
    }
}

const runTest = async(test) => {
    const sourceDir = path.join(testDir, test);

    const npmStartScript = fs.readFileSync( path.join(sourceDir, 'npm-start') ).toString();

    const defaultsDir = path.join(testDir, 'defaults');
    copyRecursive(defaultsDir, testRootDir);
    copyRecursive(sourceDir, testRootDir);

    const deps = [
        ...loadDeps(defaultsDir),
        ...loadDeps(sourceDir),
    ];

    const packageUrl = path.join(testRootDir, 'package.json');
    const pack = JSON.parse( fs.readFileSync(packageUrl) );
    pack.dependencies = Object.fromEntries( deps.map(dep => [ dep, '*' ]) );
    pack.scripts.start = npmStartScript;
    fs.writeFileSync(packageUrl, JSON.stringify(pack,null,4));

    const missing = deps.some(dep => !fs.existsSync( path.join(testRootModules,dep) ));
    if(missing) {
        console.time('yarn');
        await yarnInstall();
        await linkVuel();
        console.timeEnd('yarn');
    }

    const ps = child_process.spawn('npm', [ 'start' ], { cwd, stdio:'inherit' });
    ps.on('close', exitCode => {
        console.log({ exitCode });
    });
}




(async() => {
    try {
        if(!fs.existsSync(testDir)) {
            throw Error(__filename + ' expected to be run from root of vuel project');
        }
        let tests = fs.readdirSync(testDir).filter(test => test != 'defaults');
        if(process.argv.length > 2) {
            const specific = process.argv[2];
            if(!tests.includes(specific)) {
                throw Error('Test '+ specific + ' not found');
            }
            tests = [ specific ];
        }

        if(!fs.existsSync(testRootDir)) {
            fs.mkdirSync(testRootDir);
        }

        for await(let test of tests) {
            await runTest(test);
        }
    } catch(e) {
        console.log( chalk.red(e.message) );
        throw e;
    }
})();




