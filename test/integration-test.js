"use strict";
/*global describe:false, it:false */

var request = require("supertest");
var Resizer = require("../");
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
        resizer.attach("name")
            .publicDir(__dirname)
            .from("/test-images")
            .to("/test-out-images");
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
        resizer.attach("name")
            .publicDir(__dirname)
            .from("/test-images")
            .resize({
                width: 50,
                height: 50
            })
            .to("/test-out-images");
        app.use(resizer.app);

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });

    it("should resize images if only one dimension is given", function (done) {

        var checkFile = function () {
            var file = __dirname + "/test-out-images/profile.png";
            gm(file).size(function (err, dimensions) {
                if (err) {
                    return cleanup(file, function () {
                        done(err);
                    });
                }

                dimensions.width.should.not.be.above(50);
                fs.unlink(file, done);
            });
        };

        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer();
        resizer.attach("name")
            .publicDir(__dirname)
            .from("/test-images")
            .resize({
                width: 50
            })
            .to("/test-out-images");
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
        var resizer = new Resizer(__dirname);
        resizer.attach("name")
            .from("/test-images")
            .resizeAndCrop({
                width: 50,
                height: 50
            })
            .to("/test-out-images");
        app.use(resizer.app);

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });

    it("should save images with degradeed quality", function (done) {
        var app = express();

        app.use(express.static(__dirname + "/test-images"));
        var resizer = new Resizer(__dirname);
        resizer.attach("name")
            .from("/test-images")
            .quality(80)
            .to("/test-out-images");

        app.use(resizer.app);
        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", done));
    });

    it("should provide a helper to link to resized images", function () {
        var app = express();

        var resizer = new Resizer(__dirname);
        resizer.attach("name")
            .from("/test-images")
            .quality(80)
            .to("/test-out-images");

        app.use(resizer.app);
        app.locals.namePath.should.exist;
        app.locals.namePath("/test-images/sub-dir/test.jpg").should.eql("/test-out-images/sub-dir/test.jpg");
        app.locals.nameImage.should.exist;
        app.locals.nameImage("/test-images/test.jpg", "Alt Text").should.eql('<img src="/test-out-images/test.jpg” alt="Alt Text">');
    });

    it("should provide an app method to clear a preset", function (done) {
        var app = express();
        var resizer = new Resizer(__dirname);
        resizer.attach("name")
            .from("/test-images")
            .quality(80)
            .to("/test-out-images");

        app.use(resizer.app);
        app.resizer.clearName.should.exist;

        var checkFile = function () {
            app.resizer.clearName(function () {
                var file = "/test-out-images/profile.png";
                fs.exists(file, function (exists) {
                    exists.should.be.false;
                    done();
                });
            });
        };
        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });

    it("should provide an app method to clear a file", function (done) {
        var checkFile = function () {
            var file = "/test-images/profile.png";
            app.resizer.clear(file, done);
        };
        var app = express();
        var resizer = new Resizer(__dirname);
        resizer.attach("name")
            .from("/test-images")
            .quality(80)
            .to("/test-out-images");

        app.use(resizer.app);
        app.resizer.clear.should.exist;
        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, checkFile);
    });

    it("should return images when requed in parallel", function (done) {
        var app = express();
        var count = 0;
        var cb = function () {
            if(count++ == 5) {
                done();
            }
        };

        var resizer = new Resizer();
        resizer.attach("name")
            .publicDir(__dirname)
            .from("/test-images")
            .to("/test-out-images");
        app.use(resizer.app);
        app.use(express.static(__dirname + "/test-images"));
        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));

        request(app)
            .get("/test-out-images/profile.png")
            .expect(200, cleanup(__dirname + "/test-out-images/profile.png", cb));
    });

});
