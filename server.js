/*jshint node: true, browser: false, devel: true, white: true, forin: true, plusplus: true*/

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
    ext_libs = {};

/**
 * Serves the static file associated with a key
 * @param  {string} key A key in the mockResponses object
 * @param  {Object} req The request obj
 * @param  {Object} res The response object
 */
function serveStaticFileForKey(key, mockResponses, req, res) {
    log("[Mockaccino] Serving static file" + __dirname);
    mockUtils.serveStaticFile(mockResponses[key].path, req, res);
}

/**
 * Loads the external libs
 * @method loadExternalLibs
 * @param  {object}         cfg the config object
 */
function loadExternalLibs(cfg) {
    Object.keys(cfg.ext_libs).forEach(function (key) {
        ext_libs[key] = require(cfg.ext_libs[key]);
    });
}

function getMockserver(cfg) {
    var mockResponses;

    if (!cfg) {
        throw "FATAL: Mockaccino needs a config object to work";
    }

    mockResponses = cfg.mockResponses;

    //loads the libraries passed in the config
    loadExternalLibs(cfg);

    /**
     * There you go, here is where the magic happens and the responses are
     * assigned to the routes
     */
    app.use(express.logger());
    app.use('/v0', oldMockserver);
    app.configure(function () {

        log("[Mockaccino] Creating routes");

        var key;
        // for each line in the mockresponses configuration, creates a route
        // that either serves a file or runs a function
        for (key in mockResponses) {
            if (mockResponses[key].type === "staticFile") {
                if (mockResponses[key].method) {
                    app[mockResponses[key].method](key, serveStaticFileForKey.bind(this, key, mockResponses));
                } else {
                    app.get(key, serveStaticFileForKey.bind(this, key, mockResponses));
                }
            } else if (mockResponses[key].type === "function") {
                if (mockResponses[key].method) {
                    console.log(mockUtils.walkJSONDot(ext_libs, mockResponses[key].fn));
                    app[mockResponses[key].method](key, mockUtils.walkJSONDot(ext_libs, mockResponses[key].fn));
                } else {
                    app.get(key, mockUtils.walkJSONDot(ext_libs, mockResponses[key].fn));
                }
            }
        }
    });
    return app;
}

module.exports = getMockserver;