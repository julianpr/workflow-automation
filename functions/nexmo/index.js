const AWS = require('aws-sdk');
const axios = require('axios');
const sns = new AWS.SNS();

exports.handle = function(e, ctx, cb) {
    let sk = JSON.parse(e.Records[0].Sns.Message)
    console.log("TEST DATA IN " + JSON.stringify(sk));
    let jsonSK = JSON.parse(sk.dataIn.S);

    switch(sk.function.S) {
       case "sms" :
       axios.post("https://rest.nexmo.com/sms/json", {
           api_key: jsonSK.api_key,
           api_secret: jsonSK.api_secret,
           to: jsonSK.to,
           from: jsonSK.from,
           text: jsonSK.text
        })
        .then(response => {
            let send_data = Object.assign({"new_stream_task_id":sk.streamTaskId.S},{"data":response.data},{"new_stream_id":sk.streamId.S})
            console.log("SEND_DATA = "+JSON.stringify(send_data));
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
        .catch(err => {
            sns.publish({
                Subject: "Error",
                Message: JSON.stringify(error.response.data),
                TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:taskResponse'
            }, function(err,res){
                if (err) {
                    cb(err,null);
                } else {
                    console.log("Berhasil TAPI ERROR, dan akan di kirimkan ke Function Runner", res);
                }
            });
        })
       break;
       
       default:
       cb(null, `Module nya Nexmo ${sk.function.S} not found`);
       break;
    }
}
