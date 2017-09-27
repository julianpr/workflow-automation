const AWS = require('aws-sdk'); 
const Hashids = require('hashids');
const hashids = new Hashids('SKAX');
const dynamodb = new AWS.DynamoDB();

exports.handle = function(e, ctx, cb) {
    let workflowID = e.workflowID

    let params_getDynamodb = {
    ExpressionAttributeValues: {
        ":id": {
            S: e.streamId
            }
        }, 
        FilterExpression: "streamId = :id",
        TableName: "Triggers"
    }
    dynamodb.scan(params_getDynamodb, (err,data) => {
        if(err) {
            cb(err,null)
        } else {
            let params = {
                ExpressionAttributeNames: {
                 "#AT": "AlbumTitle", 
                 "#Y": "Year"
                }, 
                ExpressionAttributeValues: {
                 ":t": {
                   S: "Louder Than Ever"
                  }, 
                 ":y": {
                   N: "2015"
                  }
                }, 
                Key: {
                 "Artist": {
                   S: "Acme Band"
                  }, 
                 "SongTitle": {
                   S: "Happy Day"
                  }
                }, 
                ReturnValues: "ALL_NEW", 
                TableName: "Music", 
                UpdateExpression: "SET #Y = :y, #AT = :t"
               };
               dynamodb.updateItem(params, function(err, data) {
                 if (err) console.log(err, err.stack); // an error occurred
                 else     console.log(data);  
               })
        }
    })

}