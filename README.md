Q.io
==========

A message queuing service based on amazons sqs

Create Q.io

    var Q = require("Q.io"),
        q = new Q.io({
            accessKeyId    : "xxx",
            secretAccessKey: "xxx",
            awsAccountId   : "xxx",
            region         : Q.region.EU_WEST_1
        });

    var job = q.createJob("myQueueName", {
        here: "comes",
        the: "payload"
    });

    job.save(function (err, messageId) {
        console.log(err, messageId);
    });

Process jobs on a queue

    var Q = require("Q.io"),
        q = new Q.io({
            accessKeyId    : "xxx",
            secretAccessKey: "xxx",
            awsAccountId   : "xxx",
            region         : Q.region.EU_WEST_1
        });

    q.processJob("myQueueName", function (err, data, done) {
        console.log(err, data);
        done();
    });

