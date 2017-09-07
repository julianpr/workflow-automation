
var AWS = require('aws-sdk');

console.log('starting function')

function generateUUID () { 
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); 
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

exports.handle = function(e, ctx, cb) {
      var sns = new AWS.SNS()
      var sqs = new AWS.SQS()

      var body = {"secret_key": "xnd_development_P4yEfOV1g7Ktl8I4fLAbTjOTZNalp9d5kXe0+Rxj+WPQ+banDAN1gw=="};

      var jsonBody = JSON.stringify(body);
      
      var uuid = generateUUID();
      var newParams = {
        QueueName: uuid
      };

      sqs.createQueue(newParams, function(err, data){
         if (err) {
            console.log("Error creating queue", err);
         } else {
        var params = {
            MessageBody: jsonBody,
            QueueUrl: data.QueueUrl
        };
        sqs.sendMessage(params, function(err, data2){
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success sending to SQS", data.MessageId);
            

            console.log("new queue url: "+data.QueueUrl);
            sns.publish({
                Message: data.QueueUrl,
                TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:taskNotification'
            }, function(err,data){
                if (err) {
                    console.log(err.stack);
                    cb("EEERRRROOR");
                    return;
                }
                console.log('sent push');
                cb(null, 'Function finished!');
            });
            }
        });
        }
      });
};

