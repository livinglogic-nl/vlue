module.exports = class NotFoundError extends Error {
    constructor(file) {
        super(file+' not found');
        this.file = file;
    }
}
