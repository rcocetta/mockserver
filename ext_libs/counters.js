/*jshint node: true, browser: false, devel: true, white: true, forin: true, plusplus: true*/


var util = require("util"),
    mockUtils = require('../utils.js'),
    counters = {};

var lib = {
    "count": function (req, res) {
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
    },
    "reset": function (req, res) {
        counters = {};
        res.send(204, "");
    }
};

module.exports = lib;