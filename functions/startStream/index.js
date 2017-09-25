
var AWS = require('aws-sdk');

console.log('starting function')

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

// Start stream function
exports.handle = function(e, ctx, cb) {
      var sns = new AWS.SNS()
      var uuid = generateUUID();
      if (!Date.now) {
              Date.now = function() { return new Date().getTime(); }
      }

      var streamId = uuid; //temporary id for testing
      var dynamodb = new AWS.DynamoDB();
      var workflowId = (e.workflowId === undefined ? '' : e.workflowId);

      var newItem = {
            Item: {
                "streamId": {
                    S: uuid
                },
                "workflowId": {
                    S: workflowId 
                },
                "status": {
                    S: "running"
                },
                "dateStarted": {
                    S: Date.now().toString()
                }
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Streams"
        };

      dynamodb.putItem(newItem, function(err, data){
            if (err) cb(err,err.stack); //error occurred
            else {
                console.log(data);
                console.log("DB SUCCESS");

                //query workflow for tasks
                var queryParams = {
                    TableName: "Tasks",
                    ExpressionAttributeValues: {
                        ":w": {
                            S: workflowId                    
                        }
                    },
                    FilterExpression: "workflowId = :w"
                };

                dynamodb.scan(queryParams, function(err,data){
                        if (err || data.Count === 0) {
                            cb(err);
                        } else {
                            console.log("FINISHED SCANNING "+JSON.stringify(data));
                            var streamTaskIds = [];

                            for(var i = 0; i < data.Count; i++) 
                            {   
                                console.log("i = "+ i);

                                var newUuid = generateUUID();
                                streamTaskIds.push(newUuid);
                                var object = data.Items[i];
                                console.log("DATA = "+JSON.stringify(object));
                                var parentId = "0";
                                if (i !== 0) 
                                {
                                    parentId = streamTaskIds[i-1];
                                }
                                var newStreamTask = {
                                    TableName: "StreamTasks",
                                    Item: {
                                        "streamTaskId": {
                                            S: newUuid 
                                        },
                                        "streamId": {
                                            S: uuid    
                                        },
                                        "status": {
                                            S: object.status.S
                                        },
                                        "api": {
                                            S: object.api.S
                                        },
                                        "function": {
                                            S: object.function.S
                                        },
                                        "parentId": {
                                            S: parentId
                                        },
                                        "dataIn": {
                                            S: (typeof object.dataIn.S == 'undefined' ? ' ' : object.dataIn.S)
                                        },
                                        "dataOut": {
                                            S: (typeof object.dataOut.S == 'undefined' ? ' ' : object.dataOut.S)
                                        }
                                    }
                                }
                                // publish sns if first item to start off the tasks
                                if (parentId === '0')
                                {
                                    console.log("parentId = "+parentId);
                                    console.log("newStreamTask =" + JSON.stringify(newStreamTask));
                                      sns.publish({
                                          Message: JSON.stringify(newStreamTask.Item),
                                          TopicArn: 'arn:aws:sns:ap-southeast-1:455680218869:task_'+newStreamTask.Item.api.S
                                      }, function(err,data){
                                          if (err) {
                                              console.log(err.stack);
                                              cb("ERROR PUBLISHING FIRST SNS");
                                          } else {
                                          console.log('sent sns push for first task');
                                          // cb(null, 'sns pushed for first task');
                                          }
                                      });
                                      
                                  
                                }
                            
                              // insert streamTask item into dynamodb
                              dynamodb.putItem(newStreamTask, function(err,data){
                                  if (err) {
                                      cb(err);
                                  } else {
                                      console.log(null,"successfully put streamtask item")
                                  }
                              });  
                                
                            }
                        }
                    });
            }
        });
};

