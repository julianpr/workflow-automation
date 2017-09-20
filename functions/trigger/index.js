const AWS = require('aws-sdk');
const cwevents = new AWS.CloudWatchEvents()
const dynamodb = new AWS.DynamoDB()

exports.handle = function(e, ctx, cb) {
    //Dapat dari Database nya dulu
    let queryDynamodb = {
      ExpressionAttributeValues: {
        ":id": {
            S: e.streamId
         }
       }, 
      FilterExpression: "streamId = :id",
      TableName: "Triggers"
    }

    dynamodb.scan(queryDynamodb, (err,data) => {
      if(err) {
        cb(err,null)
      } else {
        let dataTriggers = data.Items[0]
        switch(dataTriggers.type.S){
          case "scheduler":
            var params = {
                Name: `CW_${dataTriggers.streamId.S}`, //ini untuk name Workflow ID nya
                RoleArn: 'arn:aws:iam::455680218869:role/SKAX_lambda_function',
                ScheduleExpression: `cron(${dataTriggers.cronDate.S})`, // ini untuk ScheduleExpressionya
                State: dataTriggers.state.S // ini untuk ENABLED atau DISABLED nya
              };
              
              cwevents.putRule(params, function(err, data) {
                if (err) {
                  console.log("Error", err);
                } else {
                  cb(null,data);
                }
              });
          break;
          default:
          cb(`Type not found ${dataTriggers.type.S}`, null)
          break;
        }
      }
    })
}