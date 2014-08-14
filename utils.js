

var util = require("util"),
    log = util.log,
    fs = require("fs");

utils = {
    /**
     * Serves a file to the response
     * @method serveStaticFile
     * @param  {string} filename Full path to get the file
     * @param  {Object} req      Request
     * @param  {Object} res      Response
     */
    serveStaticFile: function (filename, req, res, statusCode) {
        statusCode = statusCode || 200;

        try {
            log("[Mockserver] Getting file " + filename);
            fs.readFile(__dirname + filename, function(err, data){
                res.send(statusCode, data.toString());
            });

        } catch (e) {
            console.log(e);
            res.send(404, "Couldn't find the file to be served.... grrrrrr " + __dirname + filename);
        }
    }
};

module.exports = utils;