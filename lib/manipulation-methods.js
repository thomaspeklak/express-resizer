"use strict";

var types = {
    resize: function (image, options) {
        return image.resize(options.width, options.height);
    },
    resizeAndCrop: function (image, options) {
        return image
            .geometry(options.width, options.height, "^")
            .gravity(options.gravity || "center")
            .crop(options.width, options.height);
    }
};

module.exports = function (type, options, image) {
    if (!(type in types)) throw "No method " + type + " defined";

    return types[type](image, options);
};
