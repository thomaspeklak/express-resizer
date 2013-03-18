"use strict";

module.exports = function (string, upcaseFirst) {
    var name = string.replace(/([\-_\s][a-z])/g, function ($1) {
        return $1.toUpperCase().replace(/[\-_\s]/g, "");
    });
    if (upcaseFirst) {
        return name[0].toUpperCase() + name.slice(1);
    }
    return name;
};
