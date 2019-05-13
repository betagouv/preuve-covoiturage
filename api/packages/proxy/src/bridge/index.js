const Kernel = require('./kernel');

const kernel = new Kernel();
kernel.boot();

module.exports = kernel;
