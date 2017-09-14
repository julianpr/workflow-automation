const axios = require("axios");
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handle = function(e, ctx, cb) {
    let sk = JSON.parse(e.Records[0].Sns.Message)
    axios.get('https://api.xendit.co/balance', {
        auth: {
            username: sk.secret_key
        }
    })
    .then((response) => {
        let send_data = Object.assign({"new_stream_id":sk.streamTaskId},{"data":response.data})
        sns.publish({
            Subject: "Success",
            Message: JSON.stringify(send_data),
            TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:taskResponse'
        }, function(err,res){
            if (err) {
                cb(err,null);
            } else {
                console.log("Berhasil kirim dan akan di kirimkan ke Function Runner", res);
            }
        });
    })
    .catch(error => {
        sns.publish({
            Subject: "Error",
            Message: JSON.stringify(error.response.data),
            TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:taskResponse'
        }, function(err,res){
            if (err) {
                cb(err,null);
            } else {
                console.log("Berhasil kirim dan akan di kirimkan ke Function Runner", res);
            }
        });
    })
    console.log(sk.streamTaskId.S)
}
