"use strict";

var format = require("util").format;
var fs = require("fs");
var path = require("path");

var planTasks = function (preset) {
    var tasks = preset.tasks;

    var getTask = function (name) {
        var task = tasks.filter(function (task) {
            return task.type == "name";
        });
        if (!task.length) throw format("Resizer: No task with name %s present", name);

        return task[0];
    };

    var getSourceFile = function (req) {
        var targetPath = getTask("write");
        return path.join(preset.publicDir, req.path.replace(targetPath, preset.from));
    };

    return function (req, res) {
        var sourceFile = getSourceFile(req);
        fs.exists(sourceFile, function (exists) {
            if (!exists) return req.send(404);

            fs.createReadStream(sourceFile).pipe(res);
        });
    };
};

module.exports = planTasks;
