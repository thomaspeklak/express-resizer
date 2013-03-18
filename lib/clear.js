"use strict";
var path = require("path");
var fs = require("fs");
var async = require("async");

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + "/" + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

module.exports.all = function (preset) {
    return function (cb) {
        var target = path.join(preset.basePath, preset.target);
        var time = Date.now();

        walk(target, function (err, results) {
            cb && cb(err);
        });
    };
};

module.exports.file = function (presets) {
    return function (file, cb) {
        var time = Date.now();

        async.parallelLimit(
            presets.map(function (preset) {
                return function () {
                    var targetPath = path.join(
                        preset.basePath,
                        file.replace(preset.from, preset.target));
                        fs.stat(targetPath, function (err, stats) {
                            if (err) return cb && cb(err);
                            if (stats.ctime > time) return;
                            fs.unlink(targetPath, function (err) {
                                cb && cb(err);
                            });
                        });
                };
            }),
            5,
        cb);
    };
};
