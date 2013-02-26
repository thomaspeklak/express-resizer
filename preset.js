"use strict";

var gm = require("gm");
var TaskQueue = require("./lib/task-queue");

var Preset = function (name) {
    return Object.create(Preset.prototype, {
        name: {
            writeable: true,
            set: function (value) {
                name = value;
            },
            get: function () {
                return name || this.to;
            },
        },
        tasks: {
            value: []
        },
        queue: {
            value: new TaskQueue()
        }
    });
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

module.exports = Preset;

