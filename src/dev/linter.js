const log = require('./../log');
const requireLocal = require('./../require-local');
const chalk = require('chalk');
const fs = require('fs');
module.exports = {
    lint({filesChanged, sourceBundler, lintAll = false, fix = false}) {
        if(!fs.existsSync('eslint.config.js')) {
            log.tip('Adding an eslint.config.js makes vuel lint your code');
            return;
        }

        const CLIEngine = requireLocal('eslint').CLIEngine;
        cli = new CLIEngine({
            useEslintrc: true,
            configFile: 'eslint.config.js',
            fix,
        });

        let todo = lintAll ? Object.values(sourceBundler.scriptMap) : sourceBundler.scripts;
        todo = todo
            .filter(e => e.url.indexOf('src') === 0)
            .filter(e => e.ext === 'js' || e.ext === 'vue')


        let fixableWarningCount = 0;
        let fixableErrorCount = 0;
        const messages = [];
        todo.forEach(entry => {
            const report = cli.executeOnText(entry.source, entry.url);
            fixableErrorCount += report.fixableErrorCount;
            fixableWarningCount += report.fixableWarningCount;
            if(fix) {
                CLIEngine.outputFixes(report);
            }
            const result = report.results[0];
            messages.push(...result.messages.map(message => {
                return {
                    entry,
                    ...message,
                }
            }));
        });

        if(messages.length) {
            const max = 10;
            messages.slice(0, max).forEach(obj => {
                const {
                    ruleId,
                    line,
                    column,
                    message,
                } = obj;
                log.lint(`${obj.entry.url}:${line}:${column}`.padEnd(36) + `${chalk.green(ruleId)} ${message}`);
            });
            log.error(messages.length, 'lint issues total');

            const fixable = fixableWarningCount + fixableErrorCount;
            if(fixable>0) {
                // tips.quickSaveAction(`Fix ${fixable} lint issues`, () => {
                //     console.log('Bringing her down now...');
                // });
            }
        } else {
            log.lint('linting passed');
        }
    },
}
