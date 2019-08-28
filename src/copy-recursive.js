const fs = require('fs');
const copy = (srcDir, dstDir) => {
    let results = [];
	let src, dst;
    fs.readdirSync(srcDir).forEach((file) => {
        src = srcDir + '/' + file;
		dst = dstDir + '/' + file;
        const stat = fs.statSync(src);
        if (stat && stat.isDirectory()) {
			try {
				fs.mkdirSync(dst);
			} catch(e) {
			}
			results = results.concat(copy(src, dst));
		} else {
			try {
				fs.writeFileSync(dst, fs.readFileSync(src));
			} catch(e) {
			}
			results.push(src);
		}
    });
    return results;
}
module.exports = copy;
