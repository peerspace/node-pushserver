const config = require('./Config');
const axios = require('axios');
const util = require('util');
const logger = require('@peerspace/logging')({ obfuscate: false });

const PUSH_NOTIFICATIONS_2_BASE_URL = `http://${config.push_notifications_2_host}:${config.push_notifications_2_port}`;

exports.subscribeCallbackFunc = util.callbackify(subscribe);

async function subscribe (payload) {
  try {
    const { data } = await axios.post(`${PUSH_NOTIFICATIONS_2_BASE_URL}/subscribe`, payload);
    return data;
  } catch(e) {
    logger.ERROR('REQUEST', err.message, '', { payload }, 0);
  }
};