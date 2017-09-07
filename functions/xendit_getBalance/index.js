const axios = require("axios");
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.handle = function(e, ctx, cb) {
    const params = {
        QueueUrl: 'https://sqs.ap-southeast-1.amazonaws.com/455680218869/test_queue_1',
        MaxNumberOfMessages: 1
    };
    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.error(err, err.stack);
            cb(err);
        } else {
            //SQS Recieve Message nya.
            // cb(null, data.Messages[0].Body);

            let data = JSON.parse(data.Messages[0].Body);

            cb(null, data.secret_key);

            // ini untuk Axios nya
            // axios.get('https://api.xendit.co/balance',{ // API check Balance
            // auth: {
            //     username: secret_key.MessageAttributes.secret_key
            //   }
            // })
            //     .then(function (response) {
            //     cb(null,response.data);
            // })
            //     .catch(function (error) {
            //     cb(null,error);
            // });
        }
    });

}
