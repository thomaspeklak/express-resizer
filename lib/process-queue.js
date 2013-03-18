"use strict";

var Queue = function () {
    this.queue = {};
};

Queue.prototype.push = function (file, cb) {
    if (this.queue[file]) {
        this.queue[file].push(cb);
    } else {
        this.queue[file] = [];
        return this.process(file);
    }
};

Queue.prototype.process = function (file) {
    return function () {
        this.queue[file].forEach(function (cb) {
            cb();
        });
    }.bind(this);
};

module.exports = Queue;
