module.exports = (dir, relative) => (dir + '/' + relative).replace(/\/\.\//g, '/').replace(/[^\/]+\/\.\.\//g, '');
