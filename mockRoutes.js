
var util = require("util"),
    log = util.log,
    fs = require("fs"),
    url = require('url'),
    mockUtils = require('./utils.js');


/**
 * The mockresponses var contains the configuration for all the calls we want to mock.
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
   mockResponses = {
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
            mockUtils.serveStaticFile("/mockfiles/" + filename, req, res);
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
            res.write("Echoing your params new version\n\n\n");
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
                mockUtils.serveStaticFile("/mockfiles/cnt_3.json", req, res);
            } else if (counters.cnt1 === 2) {
                counters.cnt1 += 1;
                mockUtils.serveStaticFile("/mockfiles/cnt_2.json", req, res);
            } else {
                counters.cnt1 += 1;
                mockUtils.serveStaticFile("/mockfiles/cnt_1.json", req, res);
            }
        }
    },
    // Special call to reset all counters for test scenarios
    "/reset": {
        "type": "function",
        "fn": function (req, res) {
            counters = {};
            res.send(204, "");
        }
    }
};

module.exports = mockResponses;