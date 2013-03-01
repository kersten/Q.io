var awssum = require('awssum'),
    amazon = awssum.load('amazon/amazon'),
    Sqs = awssum.load('amazon/sqs').Sqs,
    util = require("util"),
    events = require("events"),
    _ = require("underscore")._,
    sqs;

function Job (q, name, payload) {
    this.q = q;
    this.name = name;
    this.payload = payload;

    return this;
}

Job.prototype.save = function (callback) {
    sqs.SendMessage({
        QueueName: this.name,
        MessageBody: JSON.stringify(this.payload)
    }, function(err, data) {
        if (_.isFunction(callback)) {
            callback.call([], err, data.Body.SendMessageResponse.SendMessageResult.MessageId);
        }
    });
};

function listenQueue (q, name, callback, interval) {
    console.log("look for jobs");

    sqs.ReceiveMessage({
        QueueName : name
    }, function(err, data) {
        if (_.isEmpty(data.Body.ReceiveMessageResponse.ReceiveMessageResult)) {
            setTimeout(function () {
                listenQueue(q, name, callback, interval);
            }, interval || q.interval);

            return;
        }

        callback(err, JSON.parse(data.Body.ReceiveMessageResponse.ReceiveMessageResult.Message.Body), function () {
            sqs.DeleteMessage({
                QueueName: "mail",
                ReceiptHandle: data.Body.ReceiveMessageResponse.ReceiveMessageResult.Message.ReceiptHandle
            }, function(err, data) {
                setTimeout(function () {
                    listenQueue(q, name, callback, interval);
                }, interval || q.interval);
            });
        });
    });
}

function IO (options) {
    this.interval = options.interval || 5000;

    sqs = new Sqs({
        accessKeyId     : options.accessKeyId,
        secretAccessKey : options.secretAccessKey,
        awsAccountId    : options.awsAccountId,
        region: options.region
    });
}

util.inherits(IO, events.EventEmitter);

IO.prototype.createJob = function (name, payload) {
    return new Job(this, name, payload);
};

IO.prototype.processJob = function (name, callback, interval) {
    listenQueue(this, name, callback, interval);
};

var Q = {
    io: IO,
    region: amazon
};

module.exports = Q;
