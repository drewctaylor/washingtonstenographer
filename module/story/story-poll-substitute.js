var fs = require('fs');
var mustache = require("mustache");

exports.substitute = function(filename) {
    return function(poll) {
        poll.text += mustache.render(fs.readFileSync(__dirname + filename, "UTF-8"), poll);
    };
};

