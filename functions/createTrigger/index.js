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

function cornjob_converter (date) {
    let _date = date;

    return date
}

exports.handle = function(e, ctx, cb) {
    let id = generateUUID()
    let newItem = {
        Item: {
            "triggerId": {
                S: id
            },
            "cronDate": {
                S: "0/5 * ? * * *"
            },
            "one-way": {
                BOOL: e.oneway
            },
            "startDate": {
                S: e.startDate
            },
            "workflowId": {
                S: e.workflowId
            },
            "type":{
                S: e.type
            } 
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: "Triggers"
    }

    dynamodb.putItem(newItem, (err, data) => {
        if(err) {
            cb(err,err.stack)
        } else {
            console.log(data);
            console.log("Insert 1 row");
            cb(null,"Successfully create a new Trigger from dynamodb");
        }
    })

}