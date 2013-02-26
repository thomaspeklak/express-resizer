"use strict";

var util = require("util");
var EventEmitter = require("EventEmitter");
var Preset = require("./preset");
var capitalize = require("./lib/upcase");

var express = require("express");

var Resizer = function () {
    if (!this instanceof Resizer) throw "Resizer must be invoked with new";
    this.app = express();
};

Resizer.prototype.attach = function (preset) {
    if (!preset instanceof Preset) throw "Resizer expects a Preset";

    this.generateRoute(preset);


};

Resizer.prototype.generateRoute = function(preset) {
    this.app.get("/" + preset.to + "/*", function (req, res) {

    });
};

Resizer.prototype.addHelper = function (preset) {
    this.app.locals["image" + capitalize(preset.name)] = function (src) {
        return "@TODO";
    };
};

util.inherits(Resizer, EventEmitter);

module.exports = Resizer;

