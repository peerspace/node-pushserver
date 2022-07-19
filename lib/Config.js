var _ = require('lodash');

var config;

var initialize = _.once(function (configFilePath, overrides) {
    config = _.merge({}, require(configFilePath), overrides);

    // Replace any "process.env.*" by its corresponding value
    var replaceEnvVars = function(obj) {
        _.forOwn(obj, function(value, key){
            var env = /^process\.env\.(.+)$/.exec(value);
            if(env) {
              obj[key] = process.env[env[1]];
            }
            if (typeof value === 'object') {
                replaceEnvVars(value);
            }
        });
    };

    replaceEnvVars(config);

    return config;
});

var get = function (key) {
    if (!config) initialize('../config.json');
    return config[key];
};

// twilio-notifications
var twilio_notifications_host = process.env.TWILIO_NOTIFICATIONS_HOST;
var twilio_notifications_port = process.env.TWILIO_NOTIFICATIONS_PORT || 3007;
exports.twilio_notifications_host = twilio_notifications_host;
exports.twilio_notifications_port = twilio_notifications_port;

module.exports = {
    initialize: initialize,
    get: get,
    twilio_notifications_host: twilio_notifications_host,
    twilio_notifications_port: twilio_notifications_port
}
