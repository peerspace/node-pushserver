var _ = require('lodash'),
    pushAssociations = require('./PushAssociations'),
    apnPusher = require('./APNPusher'),
    gcmPusher = require('./GCMPusher');


var send = function (pushAssociations, androidPayload, iosPayload) {
    var androidTokens = _(pushAssociations).where({type: 'android'}).map('token').value();
    var iosTokens = _(pushAssociations).where({type: 'ios'}).map('token').value();

    if (androidPayload && androidTokens.length > 0) {
        var gcmPayload = gcmPusher.buildPayload(androidPayload);
        gcmPusher.push(androidTokens, gcmPayload);
    }

    if (iosPayload && iosTokens.length > 0) {
        var apnPayload = apnPusher.buildPayload(iosPayload);
        apnPusher.push(apnPayload, iosTokens);
    }
};

var sendUsers = function (users, payload) {
    pushAssociations.getForUsers(users, function (err, pushAss) {
        if (err) return;
        send(pushAss, payload);
    });
};

var subscribe = function (deviceInfo, callback) {
    pushAssociations.add(deviceInfo.user, deviceInfo.type, deviceInfo.token, callback);
};

var unsubscribeDevice = function (deviceToken, callback) {
    pushAssociations.removeDevice(deviceToken, callback);
};

var unsubscribeUser = function (user, callback) {
    pushAssociations.removeForUser(user, callback);
};

module.exports = {
    send: send,
    sendUsers: sendUsers,
    subscribe: subscribe,
    unsubscribeDevice: unsubscribeDevice,
    unsubscribeUser: unsubscribeUser
};
