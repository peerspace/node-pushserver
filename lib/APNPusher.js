const _ = require('lodash');
const apn = require('apn');

const config = require('./Config');
const pushAssociations = require('./PushAssociations')

const apnProvider = _.once(() => {
  const apnConfig = config.get('apn');
  apnConfig.token = Buffer.from(apnConfig.token, 'base64').toString();
  apnConfig.production = process.env.CLUSTER_ID == 'prod';
  return new apn.Provider(config.get('apn'));
});

module.exports = {
    push,
    buildPayload
};

function push(notification, recipients) {
  apnProvider().send(notification, recipients)
    .then(result => console.log(result))
    .catch(err => {
      console.error(err);
      if (err.status == 410) { // bad device token
        console.log('removing invalid device token');
        pushAssociations.removeDevice(err.device);
      }
    });
};

function buildPayload(options) {
    var note = new apn.Notification();

    note.expiry = options.expiry || 0;
    note.alert = options.alert;
    note.badge = options.badge;
    note.sound = options.sound;
    note.payload = options.payload;

    return note;
}
