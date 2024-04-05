const config = require('./Config');
const axios = require('axios');
const util = require('util');

const PUSH_NOTIFICATIONS_2_BASE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}`;

exports.postRequestCallbackFunc = util.callbackify(postRequest);

async function postRequest (path, payload) {
  console.log('------------------------REQUEST PAYLOAD---------------------------',JSON.stringify(payload));
  const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/${path}`, payload);
  return data;
};