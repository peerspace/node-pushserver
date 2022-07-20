var config = require('./Config');
var express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
var _ = require('lodash');
var http = require('http');
var pushAssociations = require('./PushAssociations');
var push = require('./PushController');

var app = express();

// Middleware
app.use(compression());
app.use(bodyParser.json());

app.use(function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
});

app.post('/*', function (req, res, next) {
    if (req.is('application/json')) {
        next();
    } else {
        res.status(406).send();
    }
});

// Main API
app.post('/subscribe', function (req, res) {
    console.log('SUBSCRIBING', req.body.user, req.body.token);
    var deviceInfo = req.body;
    push.subscribe(deviceInfo, function() {
        console.log('SUBSCRIBED', req.body.user, req.body.token);
        res.send('subscribed');
    });
});

app.post('/unsubscribe', function (req, res) {
    var data = req.body;

    if (data.user) {
        console.log('UNSUBSCRIBING', req.body.user);
        push.unsubscribeUser(data.user, function() {
            console.log('UNSUBSCRIBED', req.body.user);
            res.send('unsubscribed - user');
        });
    } else if (data.token) {
        console.log('UNSUBSCRIBING', req.body.token);
        push.unsubscribeDevice(data.token, function() {
            console.log('UNSUBSCRIBED', req.body.token);
            res.send('unsubscribed - token');
        });
    } else {
        return res.status(503).send();
    }
});

app.post('/send', function (req, res) {
    console.log('SENDING', req.body.users);
    var notifs = [req.body];

    var notificationsValid = sendNotifications(notifs);

    console.log('SENT', req.body.users, notificationsValid);

    res.status(notificationsValid ? 200 : 400).send();
});

app.post('/sendBatch', function (req, res) {
    console.log('SENDING BATCH');

    var notifs = req.body.notifications;

    var notificationsValid = sendNotifications(notifs);

    console.log('SENT BATCH', notificationsValid);

    res.status(notificationsValid ? 200 : 400).send();
});

// Utils API
app.get('/users/:user/associations', function (req, res) {
    console.log('FINDING USER ASSOCIATIONS', req.params.user);

    pushAssociations.getForUser(req.params.user, function (err, items) {
        if (!err) {
            console.log('FOUND USER ASSOCITATIONS', req.params.user);
            res.send({"associations": items});
        } else {
            console.log('FINDING USER ASSOCITATIONS ERROR', req.params.user, err);
            res.status(503).send();
        }
    });
});

app.get('/users', function (req, res) {
    console.log('FINDING USERS');

    pushAssociations.getAll(function (err, pushAss) {
        if (!err) {
            console.log('FOUND USERS');
            var users = _(pushAss).map('user').unique().value();
            res.send({
                "users": users
            });
        } else {
            console.log('FINDING USERS ERROR', err);
            res.status(503).send()
        }
    });
});

app.delete('/users/:user', function (req, res) {
    console.log('DELETING USER', req.params.user);
    pushController.unsubscribeUser(req.params.user);
    res.send('ok');
});


// Helpers
function sendNotifications(notifs) {
    var areNotificationsValid = _(notifs).map(validateNotification).min().value();
    console.log("NOTIFICATIONS", JSON.stringify(notifs, null, 2), areNotificationsValid); // todo: remove
    if (!areNotificationsValid) return false;

    notifs.forEach(function (notif) {
        var users = notif.users,
            androidPayload = notif.android,
            iosPayload = notif.ios,
            target;

        // if (androidPayload && iosPayload) {
        //     target = 'all'
        // } else if (iosPayload) {
        //     target = 'ios'
        // } else if (androidPayload) {
        //     target = 'android';
        // }

        // redirect to twilio-notifications-svc
        if (androidPayload) {
            console.log("REDIRECTING TO TWILIO-NOTIFICATIONS:", JSON.stringify(androidPayload, null, 2));
            redirectToTwilio(androidPayload); // todo: redirect as bulk?
        }
        if (iosPayload) {
            var fetchUsers = users ? pushAssociations.getForUsers : pushAssociations.getAll,
                callback = function (err, pushAssociations) {
                    if (err) return;

                    // if (target !== 'all') {
                    // TODO: do it in mongo instead of here ...
                    // 'ios' is hard-coded here since we redirect all android notifications
                    pushAssociations = _.where(pushAssociations, { 'type': 'ios' }); // todo: this step seems redundant
                    // }

                    push.send(pushAssociations, iosPayload);
                },
                args = users ? [users, callback] : [callback];

            // TODO: optim. -> mutualise user fetching ?
            fetchUsers.apply(null, args);
        }
    });

    return true;
}

function validateNotification(notif) {
    var valid = true;

    valid = valid && (!!notif.ios || !!notif.android);
    // TODO: validate content

    return valid;
}

function redirectToTwilio(androidPayload) {
    const postData = JSON.stringify(androidPayload);
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
}

exports.start = function () {
    app.listen(config.get('webPort'));
    console.log('Listening on port ' + config.get('webPort') + "...");
};
