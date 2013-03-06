"use strict";

var ProcessingQueue = require("./lib/processing-queue");

var Preset = function (name) {
    this.name = name;
    this.tasks = [];
    this.target = null;
    this.processingQueue = new ProcessingQueue();
};

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

Preset.prototype.thumb = function (options) {
    this.tasks.push({
        type: "thumb",
        options: options
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
