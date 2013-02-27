"use strict";

var util = require("util");
var EventEmitter = require("EventEmitter");
var Preset = require("./preset");
var capitalize = require("./lib/upcase");
var Processor = require("./lib/processor");

var express = require("express");

var Resizer = function () {
    if (!this instanceof Resizer) throw "Resizer must be invoked with new";
    this.app = express();
};

Resizer.prototype.attach = function (preset) {
    if (!preset instanceof Preset) throw "Resizer expects a Preset";
    if (!preset.target) throw "Preset needs a target to write to";

    this.generateRoute(preset);
    this.addHelper(preset);


};

Resizer.prototype.generateRoute = function (preset) {
    var processor = new Processor(preset);
    this.app.get("/" + preset.target + "/*", function (req, res) {
        res.send(processor(req, res));
    });
};

Resizer.prototype.addHelper = function (preset) {
    this.app.locals["image" + capitalize(preset.name)] = function (src) {
        return src.replace(
            preset.from,
            preset.target,
            src);
    };
};

util.inherits(Resizer, EventEmitter);

module.exports = Resizer;

