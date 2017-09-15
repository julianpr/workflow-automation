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
      let uuid = generateUUID();
      let newParams = {
          QueueName: uuid
      };

      console.log("TEST FUNCTION RUNNER INPUT: " + JSON.stringify(e));

      let snsMessage = JSON.parse(e.Records[0].Sns.Message);
      console.log("TEST FUNCTION RUNNER INPUT: " + JSON.stringify(snsMessage));

      let newStreamId = snsMessage.new_stream_id;
      let newStreamTaskId = snsMessage.new_stream_task_id;
      console.log("TEST STREAM ID: " + newStreamId);
      // if (typeof newStreamId === 'undefined' || newStreamId === "")
      // {
      //   console.log("did we go here??");
      //   cb("can't get newStreamId",null);
      //   return
      // }

      //Pertama Get data nya
      let params = {
        ExpressionAttributeValues: {
            ":id": {
                S: newStreamId
             }
           }, 
        FilterExpression: "streamId = :id",
        TableName: "StreamTasks"
       };

       console.log("Scanning streamtasks table");
       dynamodb.scan(params, (err,data) => { // ini akan di ganti dari scan ke query
           if(err){
               cb(err,null)
           } else {

                console.log("INSIDE SCAN ");
                console.log("TEST DATA: "+JSON.stringify(data));
                // if(e.Records[0].Sns.Subject === "Success"){
                //     console.log(e.Records[0].Sns.Message)
                // } else {
                //     // kalau dia error tolong di break;
                //     console.log(e.Records[0].Sns.Message)
                // }
                
                data.Items.forEach((data,i) => {
                    console.log("TEST 123");
                    console.log("data = "+data);
                    console.log("newStreamId: "+newStreamId);
                    if (data.streamTaskId.S === newStreamTaskId)
                    {
                      var newStatus = "success"
                      if(e.Records[0].Sns.Subject !== "Success") {
                         newStatus = "failed"
                      }
                      var updateParams = {
                        TableName: 'StreamTasks',
                        Key: {
                          "streamTaskId": {
                            S:newStreamTaskId
                          }
                        },
                        UpdateExpression: "SET #status =:status",
                        ExpressionAttributeNames: {
                          "#status": "status"
                        },
                        ExpressionAttributeValues: {
                          ":status": {
                            S: newStatus
                          }
                        }
                      }

                      console.log("UPDATE ITEM!!");

                      dynamodb.updateItem(updateParams, function(err, data){
                        if (err)
                        {
                          cb(err);
                          return
                        } else {
                          if (newStatus === "failed")
                          {
                              cb("task failed",null);
                              return
                          }
                        }
                      });
                    }

                    console.log("DATA? : "+JSON.stringify(data))

                    //success so continue getting other streamTasks
                    if(data.parentId.S === newStreamTaskId){
                        //case kalau dia ketemu yang sama
                            sns.publish({
                                Message: JSON.stringify(data),
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

