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
            stdout.pipe(fs.createWriteStream(path.join(preset.basePath, req.path)));
            stderr.pipe(process.stderr);
        });
    };

    return function (req, res) {
        var sourceFile = getSourceFile(req);
        fs.exists(sourceFile, function (exists) {
            if (!exists) return res.send(404);
            var targetPath = path.join(preset.basePath, req.path);
            var targetDir = path.dirname(targetPath);

            fs.exists(targetDir, function (exists) {
                if (!exists) {
                    return mkdirp(targetDir, function (err) {
                        if (err) {
                            console.error(err);
                            return res.send(500);
                        }

                        resizeFile(sourceFile, req, res);
                    });
                }

                resizeFile(sourceFile, req, res);
            });
        });
    };
};

module.exports = planTasks;
