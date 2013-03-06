"use strict";

var format = require("util").format;
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

var planTasks = function (preset) {
    var tasks = preset.tasks;

    var getTask = function (name) {
        var task = tasks.filter(function (task) {
            return task.type == name;
        });
        if (!task.length) throw format("Resizer: No task with name %s present", name);

        return task[0];
    };

    var getSourceFile = function (req) {
        var targetPath = getTask("write").target;
        return path.join(preset.basePath, req.path.replace(targetPath, preset.from));
    };

    var resizeFile = function (file, req, res) {
        var rs = fs.createReadStream(file);
        rs.pipe(fs.createWriteStream(path.join(preset.basePath, req.path)));
        rs.pipe(res);
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
