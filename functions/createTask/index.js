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
// Create task function
// Input: workflowId , parentId, api, apiFunction, type (optional)
exports.handle = function(e, ctx, cb) {
      var sns = new AWS.SNS()
      var sqs = new AWS.SQS()
      var uuid = generateUUID();
      if (!Date.now) {
              Date.now = function() { return new Date().getTime(); }
      }
      console.log("EVENT DEBUG: "+e);

      var workflowId = (e.workflowId === undefined ? '' : e.workflowId);
      var stepNumber = (e.stepNumber === undefined ? '' : e.stepNumber);
      var api = (e.api === undefined ? '' : e.api);
      var apiFunction = (e.apiFunction === undefined ? '' : e.apiFunction);
      var dataIn = (e.dataIn === undefined ? ' ' : e.dataIn);
      var dataOut = (e.dataOut === undefined ? ' ' :e.dataOut);
      var type = (e.type === undefined ? 'task' :e.type);


      var dynamodb = new AWS.DynamoDB();
      var newItem = { 
            Item: {
                    "taskId": {
                        S: uuid
                    },
                    "workflowId": {
                        S: workflowId
                    },
                    "stepNumber": {
                        N: stepNumber
                    },
                    "status":{
                        S: "new"
                    },
                    "api":{
                        S: api
                    },
                    "function": {
                        S: apiFunction
                    },
                    "dataIn": {
                        S: dataIn
                    },
                    "dataOut": {
                        S: dataOut
                    },
                    "type": {
                      S: type
                    }
                },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Tasks"
          };
    dynamodb.putItem(newItem, function(err, data){
            if (err) cb(err,err.stack); //error occurred
            else {
                console.log(data);
                console.log("DB SUCCESS");
                cb(null,"Successfully created a task in dynamodb!");
            }
        });
};

