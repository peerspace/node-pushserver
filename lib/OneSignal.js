const config = require('./Config');
const axios = require('axios');
const util = require('util');

const PUSH_NOTIFICATIONS_2_BASE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}/subscribe`;

exports.subscribeCallbackFunc = util.callbackify(subscribe);

async function subscribe (payload) {
  try {
    const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/subscribe`, payload);
    return data;
  } catch (e) {
    console.log("Error while calling push-notifications-2 /subscribe: ", e.message)
  }
};