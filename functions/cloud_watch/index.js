const AWS = require('aws-sdk');
var cwevents = new AWS.CloudWatchEvents()

exports.handle = function(e, ctx, cb) {

    //Dapat dari Database nya dulu
    var params = {
        Name: 'WF000011111', //ini untuk name Workflow ID nya
        RoleArn: 'arn:aws:iam::455680218869:role/SKAX_lambda_function',
        ScheduleExpression: 'cron(0/5 * ? * * *)', // ini untuk ScheduleExpressionya
        State: 'DISABLED' // ini untuk Enable sama Disable nya
      };
      
      cwevents.putRule(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.RuleArn);
          //Triger kan SS nya
        }
      });
}