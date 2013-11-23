/*jslint node: true, es5: true, browser: false, devel: true, vars: true, white: true, forin: true, plusplus: true, todo: true, nomen:true */

var app = require('./server');

require('http').createServer(app);
module.exports = app;