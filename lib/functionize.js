"use strict";

module.exports = function (string) {
    return string.replace(/([\-_\s][a-z])/g, function($1){return $1.toUpperCase().replace(/[\-_\s]/g,'');});
};
