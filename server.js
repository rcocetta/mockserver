/*jslint node: true, es5: true, browser: false, devel: true, vars: true, nomen:true, forin: true, plusplus: true, todo: true, unparam: true */
/*global require*/

/**
 * This is a node server used to mock the web service layer
 *  @author R.Cocetta
 */

"use strict";

var path = require('path'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    url = require('url'),
    counters = {},
    util = require("util"),
    log = util.log;


/**
 * Serves a file to the response
 * @method serveStaticFile
 * @param  {string} filename Full path to get the file
 * @param  {Object} req      Request
 * @param  {Object} res      Response
 */
function serveStaticFile(filename, req, res, statusCode) {

    statusCode = statusCode || 200;

    try {
        /*jslint stupid: true */
        log("[Mockserver] Getting file " + filename);
        var fileContent = fs.readFileSync(__dirname + filename).toString();
        /*jslint stupid: false */
        res.send(statusCode, fileContent);
    } catch (e) {
        res.send(404, "Couldn't find the file to be served.... grrrrrr ");
    }
}

/**
 * The mockresponses var contains the configuration for all the calls we want to mock... yes, I know, we can put this in a separate file,
 * but for the moment it's here.
 *
 * The behaviour of every route is determined by the "Type" property:
 *        - function: the server will run the function defined in the fn property
 *        - staticFile: the server will serve the content of the static file
 *
 * If the "method" key is specified you can define which HTTP method the server will
 * use for a certain route (e.g. GET, POST, DELETE). The default is GET
 *
 * @type {Object}
 */
var mockResponses = {
    //simplest way to use the mockserver: ask it to serve a file on request
    "/exampleStatic": {
        "type": "staticFile",
        "path": "/mockfiles/res_static_1.json"
    },
    "/exampleFunction": {
        "type": "function",
        "fn": function (req, res) {

            var queryParams = url.parse(req.url, true).query,
                filename = "res_fn_1.json",
                filename2 = "res_fn_2.json";

            if (queryParams.reqId === "500") {
                res.send(500, "Forcing a 500");
                return;
            }
            if (queryParams.reqId === "2") {
                filename = filename2;
            }
            serveStaticFile("/mockfiles/" + filename, req, res);
        }
    },
    //if a "method" is specified, this route will only reply on that HTTP method
    "/exampleStaticPost": {
        "method": "post",
        "type": "staticFile",
        "path": "/mockfiles/res_static_post.json"
    },
    //Another example of function
    "/echo": {
        "type": "function",
        "fn": function (req, res) {

            var queryParams = url.parse(req.url, true).query,
                key;
            res.write("Echoing your params\n\n\n");
            for (key in queryParams) {
                res.write("\n" + key + " = " + queryParams[key]);
            }
            res.end();
        }
    },

    // Using the counter you can get the server to behave differently each time
    // a route gets hit
    "/counter": {
        "type": "function",
        "fn": function (req, res) {
            if (!counters.cnt1) {
                counters.cnt1 = 0;
            }
            log(counters.cnt1);
            if (counters.cnt1 === 3) {
                counters.cnt1 = 0;
                serveStaticFile("/mockfiles/cnt_3.json", req, res);
            } else if (counters.cnt1 === 2) {
                counters.cnt1 += 1;
                serveStaticFile("/mockfiles/cnt_2.json", req, res);
            } else {
                counters.cnt1 += 1;
                serveStaticFile("/mockfiles/cnt_1.json", req, res);
            }
        }
    },
    // Sepcial call to reset all counters for test scenarios
    "/reset": {
        "type": "function",
        "fn": function (req, res) {
            counters = {};
            res.send(204, "");
        }
    }
};

/**
 * Serves the static file associated with a key
 * @param  {string} key A key in the mockResponses object
 * @param  {Object} req The request obj
 * @param  {Object} res The response object
 */
function serveStaticFileForKey(key, req, res) {
    log("[Mockserver] Serving static file" + __dirname);
    serveStaticFile(mockResponses[key].path, req, res);
}


/**
 * There you go, here is where the magic happens and the responses are
 * assigned to the routes
 */

app.use(express.logger());
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