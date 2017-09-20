const AWS = require('aws-sdk');
const cwevents = new AWS.CloudWatchEvents()
const dynamodb = new AWS.DynamoDB()
const lambda = new AWS.Lambda();

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
            let params_putRule = {
                Name: `CW_${dataTriggers.streamId.S}`, //ini untuk name Workflow ID nya
                RoleArn: 'arn:aws:iam::455680218869:role/SKAX_lambda_function',
                ScheduleExpression: `cron(${dataTriggers.cronDate.S})`, // ini untuk ScheduleExpressionya
                State: dataTriggers.state.S // ini untuk ENABLED atau DISABLED nya
              };
              
              cwevents.putRule(params_putRule, function(err, data) {
                if (err) {
                  console.log("Error", err);
                } else {
                  let params_putTarget = {
                    Rule: `CW_${dataTriggers.streamId.S}`,
                    Targets: [
                      {
                        Id : `CW_${dataTriggers.streamId.S}`,
                        Arn: 'arn:aws:lambda:ap-southeast-1:455680218869:function:SKAX_startStream'
                      }
                    ]
                  }
                  cwevents.putTargets(params_putTarget, function(err, data) {
                    if (err) {
                      console.log("Error", err);
                    } else {
                      // cb(null,data);
                      let params_addPermission = {
                        Action: "lambda:InvokeFunction", 
                        FunctionName: "SKAX_startStream", 
                        Principal: "events.amazonaws.com",
                        SourceArn: `arn:aws:events:ap-southeast-1:455680218869:rule/CW_${dataTriggers.streamId.S}`, 
                        StatementId: `lambda_${dataTriggers.streamId.S}`
                      }
                      lambda.addPermission(params_addPermission, (err, data) => {
                        if(err) {
                          cb(err,null);
                        } else {
                          cb(null,data);
                        }
                      })
                    }
                  });
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