/*jslint node: true, browser: false, devel: true, vars: true, nomen:true, forin: true, plusplus: true, todo: true, unparam: true */
/*global require*/

/**
 * This is a node server used to mock the web service layer
 *  @author R.Cocetta
 *  @todo: move the config out
 */

"use strict";

var path = require('path'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    url = require('url'),
    counters = {},
    util = require("util"),
    oldMockserver = require('wsmockapp_v0'),
    log = util.log,
    mockUtils = require("./utils.js"),
    mockResponses = require("./mockRoutes");




/**
 * Serves the static file associated with a key
 * @param  {string} key A key in the mockResponses object
 * @param  {Object} req The request obj
 * @param  {Object} res The response object
 */
function serveStaticFileForKey(key, req, res) {
    log("[Mockserver] Serving static file" + __dirname);
    mockUtils.serveStaticFile(mockResponses[key].path, req, res);
}


/**
 * There you go, here is where the magic happens and the responses are
 * assigned to the routes
 */

app.use(express.logger());
app.use('/v0', oldMockserver);
app.configure(function () {

    log("[Mockserver] Creating routes");

    var key;
    // for each line in the mockresponses configuration, creates a route
    // that either serves a file or runs a function
    for (key in mockResponses) {
        if (mockResponses[key].type === "staticFile") {
            if (mockResponses[key].method) {
                app[mockResponses[key].method](key, serveStaticFileForKey.bind(this, key));
            } else {
                app.get(key, serveStaticFileForKey.bind(this, key));
            }
        } else if (mockResponses[key].type === "function") {
            if (mockResponses[key].method) {
                app[mockResponses[key].method](key, mockResponses[key].fn);
            } else {
                app.get(key, mockResponses[key].fn);
            }
        }
    }
});

module.exports = app;