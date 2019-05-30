const { SourceMapConsumer } = require('source-map');
const lines = require('./get-line-count');
module.exports = async(sourceMap, entries, idx) => {
    const entry = entries[idx];
    let offset = 0;
    for(let i=0; i<idx; i++) {
        offset += lines( entries[i].str );
    }

    console.log('-'.repeat(60));
    // console.log(entry.source);
    console.log(entry.str);
    console.log('-'.repeat(60));
    let generated = entry.str.split('\n');
    let source = entry.source.split('\n');

    await SourceMapConsumer.with(sourceMap, null, consumer => {
        for(let i=0; i<generated.length; i++) {
            let line = offset + i + 1;
            let matched = '';
            let original = consumer.originalPositionFor({ line, column:0 });
            if(original) {
                matched = source[original.line-1] + ' '+original.source;
            }
            console.log([
                (i+'').padEnd(3),
                generated[i].padEnd(50),
                matched
            ].join(''));
        }
    });

}
