"use strict";

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var gm = require("gm");
var manipulationMethods = require("./manipulation-methods");

var planTasks = function (preset) {
    var tasks = preset.tasks;

    var getSourceFile = function (req) {
        var targetPath = preset.target;
        return path.join(preset.basePath, req.path.replace(targetPath, preset.from));
    };

    var getTargetDirectory = function (req) {
        var targetPath = path.join(preset.basePath, req.path);
        return path.dirname(targetPath);
    };

    var getTargetFilePath = function (req) {
        return path.join(preset.basePath, req.path);
    };

    var resizeFile = function (file, req, res) {
        var rs = fs.createReadStream(file);
        var image = gm(rs);

        tasks.forEach(function (task) {
            manipulationMethods(task.type, task.options, image);
        });

        image.stream(function (err, stdout, stderr) {
            if (err) {
                console.error(err);
            }
            stdout.pipe(res);
            stdout.pipe(fs.createWriteStream(getTargetFilePath(req)));
            stderr.pipe(process.stderr);
        });
    };

    var createNonExistingDirectories = function (req, cb) {
        var sourceFile = getSourceFile(req);
        fs.exists(sourceFile, function (exists) {
            if (!exists) return cb(404);
            var targetDir = getTargetDirectory(req);

            fs.exists(targetDir, function (exists) {
                if (!exists) {
                    return mkdirp(targetDir, function (err) {
                        cb(err);
                    });
                }
                cb();
            });
        });
    };

    var fileExistsAndIsValid = function (req, cb) {
        var sourceFile = getSourceFile(req);
        var targetFile = getTargetFilePath(req);
        fs.exists(targetFile, function (exists) {
            if (!exists) return cb(null, false);
            fs.stat(sourceFile, function (err, sourceStat) {
                if (err) return cb(err);
                var sourceCtime = sourceStat.ctime;
                fs.stat(targetFile, function (err, targetStat) {
                    console.dir(err);
                    if (err) return cb(err);
                    var targetCtime = targetStat.ctime;

                    return cb(null, targetCtime > sourceCtime);
                });
            });
        });
    };

    return function (req, res, next) {
        var sourceFile = getSourceFile(req);
        fileExistsAndIsValid(req, function (err, valid) {
            if (err) return next(err);
            if (valid) {
                return next();
            }

            createNonExistingDirectories(req, function (err) {
                if (err) {
                    console.error(err);
                    return res.send(500);
                }
                resizeFile(sourceFile, req, res);
            });
        });

    };
};

module.exports = planTasks;
