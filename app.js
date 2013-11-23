/*jslint node: true, es5: true, browser: false, devel: true, vars: true, white: true, forin: true, plusplus: true, todo: true */

"use strict";
var app = require('./server'),
    port = (process.env.PORT || 8081),
    maxSockets = 150,
    http;

http = require('http');

http.globalAgent.maxSockets = maxSockets;
if (!module.parent){
	//if it's running stand alone
	http.createServer(app).listen(port, function () {
	    console.log('Web service mock server listening on port ' + port);
	});
}
return app;

