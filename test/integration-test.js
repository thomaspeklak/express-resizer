"use strict";

var Resizer = require("../");
var Preset = require("../preset");

describe("resizer", function () {
    it("should resize images on the fly", function (done) {
        var express = require("express");
        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer();
        resizer.attach("name", (new Preset(__dirname))
                       .from("/test-images")
                       .resize({
                           width: 100,
                           height: 100
                       })
                       .to("/test-out-images"));
        app.use(resizer);

    });
});
