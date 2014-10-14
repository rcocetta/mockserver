/*jshint node: true, browser: false, devel: true, white: true, forin: true, plusplus: true*/

/**
 * This is an example library for the Mockaccino
 *  @author R.Cocetta
 */

"use strict";


var fs = require("fs"),
    url = require('url'),
    mockUtils = require('../utils.js');



var lib = {
    exampleFunction1: function (req, res) {
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
    },
    echo: function (req, res) {

        var queryParams = url.parse(req.url, true).query,
            key;
        res.write("Echoing your params new version\n\n\n");
        Object.keys(queryParams).forEach(function (key) {
            res.write("\n" + key + " = " + queryParams[key]);
        });

        res.end();
    }
};

module.exports = lib;