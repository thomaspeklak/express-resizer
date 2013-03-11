"use strict";
/*global describe:false, it:false */

var request = require("supertest");
var Resizer = require("../");
var Preset = require("../preset");
var express = require("express");
var fs = require("fs");
var gm = require("gm");

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

    it("should resize images to specified dimensions", function (done) {

        var checkFile = function () {
            var file = __dirname + "/test-out-images/profile.png";
            gm(file).size(function (err, dimensions) {
                if (err) {
                    return cleanup(file, function () {
                        done(err);
                    });
                }

                dimensions.width.should.not.be.above(50);
                dimensions.height.should.not.be.above(50);
                fs.unlink(file, done);
            });
        };

        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer();
        resizer.attach((new Preset("name"))
            .publicDir(__dirname)
            .from("/test-images")
            .resize({
            width: 50,
            height: 50
        })
            .to("/test-out-images"));
        app.use(resizer.app);

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });

    it("should resize images to specified dimensions", function (done) {

        var checkFile = function () {
            var file = __dirname + "/test-out-images/profile.png";
            gm(file).size(function (err, dimensions) {
                if (err) {
                    return cleanup(file, function () {
                        done(err);
                    });
                }

                dimensions.width.should.eql(50);
                dimensions.height.should.eql(50);
                fs.unlink(file, done);
            });
        };

        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer();
        resizer.attach((new Preset("name"))
            .publicDir(__dirname)
            .from("/test-images")
            .resizeAndCrop({
            width: 50,
            height: 50
        })
            .to("/test-out-images"));
        app.use(resizer.app);

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });
});
