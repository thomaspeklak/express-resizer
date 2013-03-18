"use strict";

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var functionize = require("./lib/functionize");
var planTasks = require("./lib/plan-tasks");
var Preset = require("./lib/preset");
var clear = require("./lib/clear");

var express = require("express");

var Resizer = function (publicDir) {
    if (!this instanceof Resizer) throw "Resizer must be invoked with new";
    var self = this;
    this.app = express();
    this.presets = [];
    this.publicDir = publicDir;
    this.app.on("mount", function () {
        self.addHelpers();
        self.addUpdateHelpers();
    });
};

util.inherits(Resizer, EventEmitter);

Resizer.prototype.attach = function (name) {
    var self = this;
    var preset = new Preset(name);
    preset.publicDir(this.publicDir);

    preset.once("done", function (preset) {
        if (!preset.target) throw "Preset needs a target to write to";

        self.generateRoute(preset);
        self.presets.push(preset);
    });

    return preset;
};

Resizer.prototype.generateRoute = function (preset) {
    this.app.get(preset.target + "/*", planTasks(preset));
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

Resizer.prototype.addUpdateHelpers = function () {
    var self = this;
    if (self.app.parent.resizer) {
        throw "Resizre can not add deletion und update helpers because resizer is already defined in app.";
    }

    self.app.parent.resizer = {};

    this.presets.forEach(function (preset) {
        self.app.parent.resizer["clear" + functionize(preset.name, true)] = function () {
            clear.all(preset);
        };
    });
    self.app.parent.resizer.clear = clear.file(this.presets);
};


module.exports = Resizer;
