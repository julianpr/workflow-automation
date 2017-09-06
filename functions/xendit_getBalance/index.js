const axios = require("axios");

exports.handle = function(e, ctx, cb) {
    axios.get('https://api.xendit.co/balance',{ // API check Balance
    auth: {
        username: 'xnd_development_P4yEfOV1g7Ktl8I4fLAbTjOTZNalp9d5kXe0+Rxj+WPQ+banDAN1gw=='
      }
    })
        .then(function (response) {
        cb(null,response.data);
    })
        .catch(function (error) {
        cb(null,error);
    });
}
