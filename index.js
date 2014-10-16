/*jshint node:true, white:true */

function getApp(cfg) {
    var app = require('./server')(cfg);
    require('http').createServer(app);
    return app;
}
module.exports = getApp;