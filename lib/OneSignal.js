const config = require('./Config');
const axios = require('axios');
const util = require('util');

const PUSH_NOTIFICATIONS_2_BASE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}`;

exports.subscribeCallbackFunc = util.callbackify(subscribe);
exports.unsubscribeCallbackFunc = util.callbackify(unsubscribe);
exports.sendCallbackFunc = util.callbackify(send);

async function subscribe (payload) {
  const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/subscribe`, payload);
  return data;
};

async function unsubscribe (payload) {
  const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/unsubscribe`, payload);
  return data;
};

async function send (payload) {
  const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/send`, payload);
  return data;
};