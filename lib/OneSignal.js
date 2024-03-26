const config = require('./Config');
const http = require('http');

exports.subscribe = function (payload) {
  console.log(">>>>>>REDIRECTING TO PUSH-NOTIFICATIONS-2>>>>>>", JSON.stringify(payload));
 
  const payloadStringified = JSON.stringify(payload);
  const request_params = {
    host: config.push_notifications_2_host,
    port: config.push_notifications_2_port,
    path: "/subscribe",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payloadStringified),
    },
  };

  const req = http.request(request_params, (res) => {
    console.log("PUSH NOTIFICATIONS 2 RESPONSE:", res.statusCode);
    res.setEncoding("utf-8");
    res.on("data", (chunk) => {
      console.log("BODY:", chunk);
    });
  });

  req.on("error", (e) => {
    console.error(`PUSH NOTIFICATIONS 2 ERROR: ${e.message}`);
  });

  req.write(payloadStringified);
  req.end();
};
