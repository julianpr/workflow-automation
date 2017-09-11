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
        TableName: "StreamTasks"
       };
       dynamodb.scan(params, (err,data) => {
           if(err){
               cb(err,null)
           } else {
               cb(null,data);
           }
       })

    //   if(e.Records[0].Sns.Subject === "Respone Not Error"){
    //       console.log(e.Records[0].Sns.Message)
    //   } else {
    //       console.log(e.Records[0].Sns.Message)
    //   }
};

