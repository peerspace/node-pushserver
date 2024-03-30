const config = require('./Config');
const axios = require('axios');
const util = require('util');

const PUSH_NOTIFICATIONS_2_SUBSCRIBE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}/subscribe`;
const PUSH_NOTIFICATIONS_2_UNSUBSCRIBE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}/unsubscribe`;

exports.subscribeCallbackFunc = util.callbackify(subscribe);
exports.unsubscribeCallbackFunc = util.callbackify(unsubscribe);

async function subscribe (payload) {
  try {
    const { data } = await axios.post(PUSH_NOTIFICATIONS_2_SUBSCRIBE_URL, payload);
    return data;
  } catch(e) {
    console.log("Error while calling push_notifications_2: ", e)
  }
};

async function unsubscribe (payload) {
  try {
    const { data } = await axios.post(PUSH_NOTIFICATIONS_2_UNSUBSCRIBE_URL, payload);
    console.log('------------------------UNSUBSCRIBE RESPONSE---------------------------',JSON.stringify(data));
    return data;
    
  } catch(e) {
    console.log("Error while calling push_notifications_2: ", e)
  }
};