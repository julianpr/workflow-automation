const axios = require("axios");
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.handle = function(e, ctx, cb) {
    let url = e.Records[0].Sns.Message
    const params = {
        QueueUrl: url,
        MaxNumberOfMessages: 1
    };
    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.error(err, err.stack);
            cb(err);
        } else {
            //SQS Recieve Message nya.
            let data_key = JSON.parse(data.Messages[0].Body);
            let Recieve_Handel = data.Messages[0].ReceiptHandle
            // ini untuk Axios nya
            axios.get('https://api.xendit.co/balance',{ // API check Balance
            auth: {
                username: data_key.secret_key
              }
            })
                .then(function (response) {
                const params_delete = {
                    QueueUrl: url,
                    ReceiptHandle: Recieve_Handel
                }
                sqs.deleteMessage(params_delete, function(err, d) {
                    if (err) {
                        cb(err, err.stack);
                     } else {
                         console.log(response.data);
                        cb(null,response.data);
                     } 
                })
            })
                .catch(function (error) {
                cb(error,null);
            });
        }
    });

}
