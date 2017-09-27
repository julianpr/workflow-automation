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
      const AWS = require("aws-sdk");
      const dynamodb = new AWS.DynamoDB();
      const sns = new AWS.SNS();

      let response = {
            "isBase64Encoded": false,
            "statusCode": 200,
            "headers": { "headerName": "headerValue" },
            "body": "Berhasil kirim"
      }

      let params = {
        ExpressionAttributeValues: {
            ":workflow_id": {
                  S: e['pathParameters'].workflowid
             },
             ":step": {
                   N: "0"
             }
           }, 
        FilterExpression: "workflowId = :workflow_id AND stepNumber = :step",
        TableName: "Tasks"
      }

      dynamodb.scan(params, (err,data) => {
            if(err) {
                  Object.assign(response, {body : JSON.stringify(err)}, {statusCode: 501})
                  cb(null,response)
            } else {
                  let updateParams = {
                        TableName: 'Tasks',
                        Key: {
                          "taskId": {
                              S: data.Items[0].taskId.S
                          },
                          "stepNumber": {
                              N: `${data.Items[0].stepNumber.N}`
                          }
                        },
                        UpdateExpression: "SET #data_in = :Data_in",
                        ExpressionAttributeNames: {
                          "#data_in": "dataIn"
                        },
                        ExpressionAttributeValues: {
                          ":Data_in": {
                            S: e.body
                          }
                        }
                      }
                       dynamodb.updateItem(updateParams, function(err, result) {
                             if (err) {
                              Object.assign(response, {body: JSON.stringify(err)}, {statusCode: 501})
                              cb(null,response)
                              } else{
                                    let params_getTrigger = {
                                          ExpressionAttributeValues: {
                                                ":workflow_id": {
                                                      S: e['pathParameters'].workflowid
                                                 },
                                                 ":data_Type": {
                                                       S: "catch_hook"
                                                 }
                                               },
                                          ExpressionAttributeNames: {
                                                "#type_data": "type"
                                          },
                                            FilterExpression: "workflowId = :workflow_id AND #type_data = :data_Type",
                                            TableName: "Triggers"
                                    }
                                    dynamodb.scan(params_getTrigger, (err,data) => {
                                          if(err){
                                                Object.assign(response, {body: JSON.stringify(err)}, {statusCode: 501})
                                                cb(null,response)
                                          } else {
                                                let updateParams_Triggers = {
                                                      TableName: 'Triggers',
                                                      Key: {
                                                        "triggerId": {
                                                            S: data.Items[0].triggerId.S
                                                        }
                                                      },
                                                      UpdateExpression: "SET #Status = :status",
                                                      ExpressionAttributeNames: {
                                                        "#Status": "status"
                                                      },
                                                      ExpressionAttributeValues: {
                                                        ":status": {
                                                          S: "Running"
                                                        }
                                                      }
                                                }
                                                dynamodb.updateItem(updateParams_Triggers, (err, res) => {
                                                      if(err) {
                                                            Object.assign(response, {body: JSON.stringify(err)}, {statusCode: 501})
                                                            cb(null,response)
                                                      } else {
                                                            // //kirim sns nya disini
                                                            sns.publish({
                                                                  Message: JSON.stringify(e['pathParameters'].workflowid),
                                                                  TopicArn: `arn:aws:sns:ap-southeast-1:455680218869:trigger_catchhook`
                                                              }, function(err,res){
                                                                  if (err) {
                                                                      cb(err,null);
                                                                  } else {
                                                                        
                                                                        cb(null,response)
                                                                        console.log("Berhasil kirim notification ke trigger_catchooknya");
                                                                  }
                                                              });
                                                      }
                                                })
                                          }
                                    })


                              }
                       })

            }
      })
}