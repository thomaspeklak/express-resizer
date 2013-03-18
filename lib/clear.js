"use strict";
var path = require("path");
var fs = require("fs");
var async = require("async");

module.exports.all = function (preset) {
    var target = path.join(preset.basePath, preset.target);
    var time = Date.now();

    //todo recursive walk tree

};

module.exports.file = function (presets) {
    return function (file, cb) {
        var time = Date.now();

        async.parallelLimit(
            presets.map(function (preset) {
                return function () {
                    var targetPath = path.join(
                        preset.basePath,
                        file.replace(preset.from, preset.target)
                    );
                    fs.stat(targetPath, function (err, stats) {
                        if (err) return cb(err);
                        if (stats.ctime > time) return;
                        fs.unlink(targetPath, function (err) {
                            cb(err);
                        });
                    });
                };
            }),
            5,
            cb
        );
    };
};
