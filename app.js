/*jshint node: true, browser: false, devel: true, white: true, forin: true, plusplus: true*/

"use strict";
var mockresponses = require('./example.conf.json'),
    app = require('./server')(mockresponses),
    port = (process.env.PORT || 8081),
    maxSockets = 150,
    http;

http = require('http');

http.globalAgent.maxSockets = maxSockets;
if (!module.parent) {
	//if it's running stand alone
	http.createServer(app).listen(port, function () {
        console.log('[Mockaccino] listening on port ' + port);
	});
}
return app;

