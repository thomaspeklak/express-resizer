"use strict";

var capitalize = require("./lib/upcase");
var gm = require("gm");
var Preset = function () {
    if (!this instanceof Preset) throw "Preset must be invoked with new";
};

Preset.prototype.from = function (from) {
    this.from = from;
    return this;
};

Preset.prototype.to = function (to) {
    this.to = to;
    return this;
};

Preset.prototype.resize = function (options) {
    this.method = "resize";
    this.options = options;

    return this;
};

Preset.prototype.resizeAndCrop = function (options) {
    this.method = "resize";
    this.options = options;

    return this;
};

Preset.prototype.thumb = function (options) {
    this.method = "thumb";
    this.options = options;

    return this;
};

Preset.attachTo = function (app) {
    app.get("/" + this.from + "/*", function (req, res) {

    });

    app.locals["image" + capitalize(to)] = function (src) {
        return "@TODO";
    };
};

module.exports = Preset;

