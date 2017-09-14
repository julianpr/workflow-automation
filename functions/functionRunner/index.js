const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

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
      const sns = new AWS.SNS()
      let body = {"secret_key": "xnd_development_P4yEfOV1g7Ktl8I4fLAbTjOTZNalp9d5kXe0+Rxj+WPQ+banDAN1gw=="};

      let jsonBody = JSON.stringify(body);
      
      let uuid = generateUUID();
      let newParams = {
          QueueName: uuid
      };

      //Pertama Get data nya
      let params = {
        ExpressionAttributeValues: {
            ":id": {
                S: "111222"
             },
             ":pi": {
                S: "0"
             }
           }, 
        FilterExpression: "streamId = :id AND parentId <> :pi",
        TableName: "StreamTasks"
       };
       dynamodb.scan(params, (err,data) => { // ini akan di ganti dari scan ke query
           if(err){
               cb(err,null)
           } else {
                // if(e.Records[0].Sns.Subject === "Success"){
                //     console.log(e.Records[0].Sns.Message)
                // } else {
                //     // kalau dia error tolong di break;
                //     console.log(e.Records[0].Sns.Message)
                // }
                data.Items.forEach((data,i) => {
                    if(data.parentId.S === e.Records[0].Sns.Message.new_stream_id){
                        //case kalau dia ketemu yang sama
                        let newObj = Object.assign(body,data)
                            sns.publish({
                                Message: JSON.stringify(newObj),
                                TopicArn: `arn:aws:sns:ap-southeast-1:455680218869:task_${data.api.S}`
                            }, function(err,res){
                                if (err) {
                                    cb(err,null);
                                } else {
                                    console.log("Berhasil kirim dan akan di kirimkan ke Xendit Get Balance", res);
                                }
                            });
                    } else {
                        console.log("ini sudah selesai");
                    }
                })
           }
       })
};

