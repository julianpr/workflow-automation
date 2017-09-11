const axios = require("axios");
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handle = function(e, ctx, cb) {
    let msg = e.Records[0].Sns.Message.xnd_development_key
    axios.get('https://api.xendit.co/balance', {
        auth: {
            username: msg
        }
    })
    .then((response) => {
        // cb(null,response.data)
        sns.publish({
            Message: JSON.stringify(response.data),
            TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:taskNotification'
        }, function(err,data){
            if (err) {
                cb(err,null)
            } else {
                console.log(data);
            }
        });
    })
    .catch(error => {
        cb(error, null)
    })
}
    