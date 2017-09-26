
exports.handle = function(e, ctx, cb) {
    console.log(e)
    console.log(e.body)
    var body = JSON.parse(e.body);
    console.log(body.challenge)
    var challenge = {
    	"challenge": body.challenge
    }

    console.log(challenge)
    var response = {
            "isBase64Encoded": false,
            "statusCode": 200,
            "headers": { "headerName": "headerValue" },
            "body": JSON.stringify(challenge)
      }

      console.log(response)

      cb(null,response);
}
