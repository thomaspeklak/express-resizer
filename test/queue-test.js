"use strict";
/*global describe:false, it:false */

var Queue = require("../lib/process-queue");
describe("Queue", function () {
    it("should queue callbacks if the key is not registered and call them when the first cmopletes", function () {
       var queue = new Queue();
       var count = 0;
       function countUp () {
            count += 1;
       }

       var cb = queue.push("a", countUp);

        queue.push("a", countUp);
        queue.push("a", countUp);
        queue.push("a", countUp);
        queue.push("a", countUp);
        queue.push("a", countUp);

        cb();
        count.should.eql(5);
    });
});

