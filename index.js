"use strict";

var util = require("util");
var EventEmitter = require("EventEmitter");
var Preset = require("./preset");

var express = require("express");

var Resizer = function () {
    if (!this instanceof Resizer) throw "Resizer must be invoked with new";
    this.app = express();
};

Resizer.prototype.attach = function (preset) {
    if (!preset instanceof Preset) throw "Resizer expects a Preset";

    preset.attachTo(this.app);
};

util.inherits(Resizer, EventEmitter);

module.exports = Resizer;

