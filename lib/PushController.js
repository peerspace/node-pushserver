var _ = require('lodash'),
    pushAssociations = require('./PushAssociations'),
    apnPusher = require('./APNPusher'),
    http = require('http'),
    config = require('./Config');

var send = function (pushAssociations, notification) {
    var users = notification.users,
        androidPayload = notification.android,
        iosPayload = notification.ios;
    const androidAssociations = _(pushAssociations).where({type: 'android'}).value(),
          iosTokens = _(pushAssociations).where({type: 'ios'}).map('token').value();

    if (iosTokens.length > 0) {
        var apnPayload = apnPusher.buildPayload(payload);
        apnPusher.push(apnPayload, iosTokens);
    }
    if (androidAssociations.length > 0) {
        if (!androidPayload) {
            androidPayload = iosToAndroid(iosPayload);
        }
        redirectToTwilio(users, androidPayload);
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

var iosToAndroid = function (iosPayload) {
    const androidPayload = {
        body: iosPayload.alert,
        sound: iosPayload.sound,
        data: iosPayload.payload
    };
    return androidPayload;
}

var redirectToTwilio = function (users, androidPayload) {
    console.log("REDIRECTING TO TWILIO-NOTIFICATIONS");
    // todo: redirect as bulk for all users at once?
    users.forEach(user => {
        const postData = JSON.stringify({
            'user-id': user,
            ...androidPayload
        });
        var request_params = {
            host: config.twilio_notifications_host,
            port: config.twilio_notifications_port,
            path: '/twilio-notifications/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(request_params, res => {
            console.log('TWILIO NOTIFICATIONS RESPONSE:', res.statusCode);
            res.setEncoding('utf-8');
            res.on('data', chunk => {
                console.log("BODY:", chunk);
            });
        });

        req.on('error', e => {
            console.error(`TWILIO NOTIFICATIONS ERROR: ${e.message}`);
        })

        req.write(postData);
        req.end();
    });
}

module.exports = {
    send: send,
    sendUsers: sendUsers,
    subscribe: subscribe,
    unsubscribeDevice: unsubscribeDevice,
    unsubscribeUser: unsubscribeUser
};
