"use strict";

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Preset = require("./preset");
var functionize = require("./lib/functionize");
var planTasks = require("./lib/plan-tasks");

var express = require("express");

var Resizer = function () {
    if (!this instanceof Resizer) throw "Resizer must be invoked with new";
    var self = this;
    this.app = express();
    this.presets = [];
    this.app.on("mount", function () {
        self.addHelpers();
    });
};

util.inherits(Resizer, EventEmitter);

Resizer.prototype.attach = function (preset) {
    if (!preset instanceof Preset) throw "Resizer expects a Preset";
    if (!preset.target) throw "Preset needs a target to write to";

    this.generateRoute(preset);
    this.presets.push(preset);
};

Resizer.prototype.generateRoute = function (preset) {
    var handleRequest = planTasks(preset);
    this.app.get(preset.target + "/*", function (req, res) {
        handleRequest(req, res);
    });
};

Resizer.prototype.addHelpers = function () {
    var self = this;
    this.presets.forEach(function (preset) {
        self.app.parent.locals[functionize(preset.name) + "Path"] = function (src) {
            return src.replace(preset.from, preset.target, src);
        };
        self.app.parent.locals[functionize(preset.name) + "Image"] = function (src, alt) {
            return "<img src=\"" + src.replace(preset.from, preset.target, src) + "\” alt=\"" + alt + "\">";
        };
    });
};


module.exports = Resizer;
