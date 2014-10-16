/*jshint node: true, white:true */

/**
 * This is a node server used to mock a web service layer
 *  @author R.Cocetta
 */
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
 * @param   {object} req The request obj
 * @param   {object} res The response object
 * @cfgItem {object} the Config item associated with the enpoint you're treating now
 * @param   {string} key A key in the mockResponses object
 */
function serveStaticFileForKey(req, res, cfgItem, key, method) {
    log("[Mockaccino] Serving static file" + __dirname + cfgItem.path);
    mockUtils.serveStaticFile(cfgItem.path, req, res);
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

/**
 * Returns an object describing the behaviour for a single request
 * @method getBehaviourForRequest
 * @param  {object}               cfg    the full config
 * @param  {object}               qs     the parse querystring
 * @param  {string}               key    the route key
 * @param  {string}               method the HTTP method
 * @return {object}                      an object containing {cfgItem, key, method, fn}
 */
function getBehaviourForRequest(cfg, qs, key, method) {
    var qsParam = cfg.queryStringParam,
        specConfig,
        mockResponses = cfg.mockResponses;

    if ((qs) && (qsParam) && (qs[qsParam]) && (mockResponses[qs[qsParam]]) && (mockResponses[qs[qsParam]][key]) && (mockResponses[qs[qsParam]][key][method])) {
        //if there is a defined behaviour for a specific query string parameter, and that parameter is defined
        specConfig = getBehaviourFor(cfg, key, qs[qsParam], method);
    } else {
        specConfig = getBehaviourFor(cfg, key, "default", method);
    }
    return specConfig;
}

function getBehaviourFor(cfg, key, qsVal, method) {
    console.log("qsVal" + qsVal);
    console.dir(cfg.mockResponses);
    var mockResponses = cfg.mockResponses[qsVal],
        cfgItem = mockResponses[key][method],
        resObject = {
            "cfgItem": cfgItem,
            "key": key,
            "method": method
        },
        fn;

    if (cfgItem.type === "staticFile") {
        fn = serveStaticFileForKey;
    } else if (cfgItem.type === "function") {
        fn = mockUtils.walkJSONDot(ext_libs, cfgItem.fn);
    }
    resObject.fn = fn;
    return resObject;
}

/**
 * Handles a request
 * @method handleRequest
 * @param  {string}               key    the route key
 * @param  {object}               cfg    the full config
 * @param  {string}               method the HTTP method
 * @param  {[type]}      req      The Express req
 * @param  {[type]}      res      The Express res
 */
function handleRequest(key, cfg, method, req, res) {
    var qs = url.parse(req.url, true).query,
        mockResponses = cfg.mockResponses,
        behaviour = getBehaviourForRequest(cfg, qs, key, method);
    behaviour.fn(req, res, behaviour.cfgItem, behaviour.key, method);
}

function getMockserver(cfg) {
    var mockResponses;

    if (!cfg) {
        throw "FATAL: Mockaccino needs a config object to work";
    }

    mockResponses = cfg.mockResponses;

    //loads the libraries passed in the config
    loadExternalLibs(cfg);

    app.use(express.logger());

    app.configure(function () {
        log("[Mockaccino] Creating routes");

        var key;
        // for each line in the mockResponses configuration, creates a route
        // that either serves a file or runs a function
        Object.keys(mockResponses.default).forEach(function (key) {
            Object.keys(mockResponses.default[key]).forEach(function (method) {
                app[method](key, handleRequest.bind(this, key, cfg, method));
            });
        });
    });
    return app;
}

module.exports = getMockserver;