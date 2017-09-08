const axios = require("axios");

exports.handle = function(e, ctx, cb) {
    let msg = e.Records[0].Sns.Message.xnd_development_key
    axios.get('https://api.xendit.co/balance', {
        auth: {
            username: msg
        }
    })
    .then((response) => {
        cb(null,response.data)
    })
    .catch(error => {
        cb(error, null)
    })
}
    