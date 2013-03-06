"use strict";
/*global describe:false, it:false */

var request = require("supertest");
var Resizer = require("../");
var Preset = require("../preset");
var express = require("express");
var fs = require("fs");

var cleanup = function (path, cb) {
    return function () {
        fs.unlink(path, cb);
    };
};

describe("resizer", function () {
    it("should return images", function (done) {
        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer();
        resizer.attach((new Preset("name"))
            .publicDir(__dirname)
            .from("/test-images")
            .to("/test-out-images"));
        app.use(resizer.app);
        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", done));
    });

});
