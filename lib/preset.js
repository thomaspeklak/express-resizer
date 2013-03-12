"use strict";

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var ProcessingQueue = require("./processing-queue");

var Preset = function (name) {
    this.name = name;
    this.tasks = [];
    this.target = null;
    this.processingQueue = new ProcessingQueue();
};

util.inherits(Preset, EventEmitter);

Preset.prototype.publicDir = function (path) {
    this.basePath = path;
    return this;
};

Preset.prototype.from = function (from) {
    this.from = from;
    return this;
};

Preset.prototype.to = function (target) {
    this.target = target;
    Object.freeze(this);
    this.emit("done", this);

    return this;
};

Preset.prototype.resize = function (options) {
    this.tasks.push({
        type: "resize",
        options: options
    });

    return this;
};

Preset.prototype.resizeAndCrop = function (options) {
    this.tasks.push({
        type: "resizeAndCrop",
        options: options
    });

    return this;
};

Preset.prototype.quality = function (value) {
    this.tasks.push({
        type: "quality",
        options: value
    });

    return this;
};

Preset.prototype.compress = function (options) {
    this.tasks.push({
        type: "crunch",
        options: options
    });

    return this;
};

module.exports = Preset;
