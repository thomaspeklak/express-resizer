"use strict";

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var gm = require("gm");
var manipulationMethods = require("./manipulation-methods");
var Queue = require("./process-queue");
var mime = require("mime");
var Q = require("q");
var fsStat = Q.denodeify(fs.stat);

var fsExists = function (file) {
    var defer = Q.defer();
    fs.exists(file, function (exists) {
        if (exists) {
            defer.resolve();
        } else {
            defer.reject(new Error('ENOFILE'));
        }
    });

    return defer.promise;
};

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

    var setType = function (file, res) {
        var type = mime.lookup(file);
        res.header("Content-type", type);
    };

    var resizeFile = function (file, req, res, cb) {
        var rs = fs.createReadStream(file);
        var image = gm(rs);

        tasks.forEach(function (task) {
            manipulationMethods(task.type, task.options, image);
        });

        setType(file, res);

        image.stream(function (err, stdout, stderr) {
            if (err) {
                console.error(err);
                return res.send(500);
            }
            stdout.pipe(res);
            stdout.pipe(fs.createWriteStream(getTargetFilePath(req)));
            stderr.pipe(process.stderr);

            stdout.on("end", cb);
        });
    };

    var fileExistsAndIsValid = function (req, cb) {
        var sourceFile = getSourceFile(req);
        var targetFile = getTargetFilePath(req);

        Q.allSettled([fsExists(sourceFile), fsExists(targetFile)])
            .then(function (data) {
                if (data[0].state == 'rejected') return cb(404);
                if (data[1].state == 'rejected') return cb(null, null);

                return Q.all([fsStat(sourceFile), fsStat(targetFile)]).then(function (stats) {
                    if(!stats[0].isFile()) return cb(500);

                    cb(null, stats[1].ctime < stats[0].ctime);
                }, function () { cb(500); });
            });
    };

    var queue = new Queue();

    return function (req, res, next) {
        var sourceFile = getSourceFile(req);
        fileExistsAndIsValid(req, function (err, valid) {
            if (err) return res.send(err);
            if (valid) {
                return next();
            }

            var cb = queue.push(sourceFile, next);
            //file is in queue and will be served when done
            if (!cb) return;

            var targetDir = getTargetDirectory(req);

            mkdirp(targetDir, function (err) {
                if (err) {
                    console.error(err);
                    return res.send(500);
                }
                resizeFile(sourceFile, req, res, cb);
            });
        });

    };
};

module.exports = planTasks;
