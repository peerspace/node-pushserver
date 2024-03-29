const config = require('./Config');
const axios = require('axios');
const util = require('util');

const PUSH_NOTIFICATIONS_2_SUBSCRIBE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}/subscribe`;

exports.subscribeCallbackFunc = util.callbackify(subscribe);

async function subscribe (payload) {
  try {
    const { data } = await axios.post(PUSH_NOTIFICATIONS_2_SUBSCRIBE_URL, payload);
    console.log('------------------------PUSH_2_RESPONSE---------------------------',JSON.stringify(data));
    return data;
  }catch(e){
    console.log('------------------------ERROR---------------------------',JSON.stringify(e));
  }
  
};




// exports.subscribe = function (payload, callback) {
//   console.log(">>>>>>REDIRECTING TO PUSH-NOTIFICATIONS-2>>>>>>", JSON.stringify(payload));
 
//   const payloadStringified = JSON.stringify(payload);

//   const request_params = {
//     host: config.push_notifications_2_host,
//     port: config.push_notifications_2_port,
//     path: "/subscribe",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Content-Length": Buffer.byteLength(payloadStringified),
//     },
//   };

//   const req = http.request(request_params, (res) => {
//     console.log("PUSH NOTIFICATIONS 2 RESPONSE:", res.statusCode);
//     res.setEncoding("utf-8");
//     res.on("data", (chunk) => {
//       console.log("BODY:", chunk);
//     });
//   });

//   req.on("error", (e) => {
//     console.error(`PUSH NOTIFICATIONS 2 ERROR: ${e}`);
//   });

//   req.write(payloadStringified);
//   req.end();
// };
