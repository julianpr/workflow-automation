
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

exports.handle = function(e, ctx, cb) {
      var sns = new AWS.SNS()
      var sqs = new AWS.SQS()
      var uuid = generateUUID();
      if (!Date.now) {
              Date.now = function() { return new Date().getTime(); }
      }

      var dynamodb = new AWS.DynamoDB();
      var newItem = { 
            Item: {
                    "workflowId": {
                        S: uuid
                    },
                    "name": {
                        S: "testWorkflow"
                    },
                    "dateCreated":{
                        N: Date.now()
                    },
                    "deleteFlag":{
                        BOOL: false
                    },
                    "draftFlag": {
                        BOOL: false
                    },
                    "isActive": {
                        BOOL: false
                    },
                },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Workflows"
          };
    dynamodb.putItem(params, function(err, data){
            if (err) console.log(err,err.stack); //error occurred
            else console.log(data);
        });
};

