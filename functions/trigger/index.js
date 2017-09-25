const AWS = require('aws-sdk');
const cwevents = new AWS.CloudWatchEvents()
const dynamodb = new AWS.DynamoDB()
const lambda = new AWS.Lambda();

exports.handle = function(e, ctx, cb) {
    // ini toggle nya untuk ON
    if(e.toggle === "On"){
      //Dapat dari Database nya dulu
      let queryDynamodb = {
        ExpressionAttributeValues: {
          ":id": {
              S: e.workflowId
           }
         }, 
        FilterExpression: "workflowId = :id",
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
                  Name: `CW_${dataTriggers.workflowId.S}`, //ini untuk name Workflow ID nya
                  RoleArn: 'arn:aws:iam::455680218869:role/SKAX_lambda_function',
                  ScheduleExpression: `cron(${dataTriggers.cronDate.S})`, // ini untuk ScheduleExpressionya
                  State: "ENABLED" // ini untuk ENABLED atau DISABLED nya
                };
                cwevents.putRule(params_putRule, function(err, data) {
                  if (err) {
                    cb(err,null);
                  } else {
                    // ini put target 
                    let params_putTarget = {
                      Rule: `CW_${dataTriggers.workflowId.S}`,
                      Targets: [
                        {
                          Id : `CW_${dataTriggers.workflowId.S}`,
                          Arn: 'arn:aws:lambda:ap-southeast-1:455680218869:function:SKAX_startStream'
                        }
                      ]
                    }
                    cwevents.putTargets(params_putTarget, function(err, data) {
                      if (err) {
                        cb(err,null);
                      } else {
                        let params_putEvent = {
                          Entries: [
                            {
                              Detail: `{ \"workflowId\": \"${dataTriggers.workflowId.S}\"}`,
                              DetailType: dataTriggers.workflowId.S,
                              Resources: [
                                `arn:aws:events:ap-southeast-1:455680218869:rule/CW_AntoniAngga`
                              ],
                              Source: "asdasdasd",
                              Time: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
                            },
                          ]
                        };
                        cwevents.putEvents(params_putEvent, function(err, data) {
                          if (err){ 
                            console.log(err, err.stack);
                          } else {
                            console.log(data);
                            let params_addPermission = {
                              Action: "lambda:InvokeFunction", 
                              FunctionName: "SKAX_startStream", 
                              Principal: "events.amazonaws.com",
                              SourceArn: `arn:aws:events:ap-southeast-1:455680218869:rule/CW_${dataTriggers.workflowId.S}`, 
                              StatementId: `lambda_${dataTriggers.workflowId.S}`
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
                  }
                });
            break;

            default:
            cb(`Type not found ${dataTriggers.type.S}`, null)
            break;
          }
        }
      })
      // untuk toggle OFF nya
    } else {
      let queryDynamodb = {
        ExpressionAttributeValues: {
          ":id": {
              S: e.workflowId
           }
         }, 
        FilterExpression: "workflowId = :id",
        TableName: "Triggers"
      }
  
      dynamodb.scan(queryDynamodb, (err,data) => {
        let dataTriggers = data.Items[0];
        if(err) {
          cb(err, null);
        } else {
          let params_putRule = {
            Name: `CW_${dataTriggers.workflowId.S}`, //ini untuk name Workflow ID nya
            RoleArn: 'arn:aws:iam::455680218869:role/SKAX_lambda_function',
            ScheduleExpression: `cron(${dataTriggers.cronDate.S})`, // ini untuk ScheduleExpressionya
            State: "DISABLED" // ini untuk ENABLED atau DISABLED nya
          };
          cwevents.putRule(params_putRule, function(err, data) {
            if (err) {
              cb(err,null);
            } else {
              cb(null,`State Now Disable ${data}`)
            }
          })
        }
      })
    }
}
