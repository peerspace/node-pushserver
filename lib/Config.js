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

module.exports = {
    initialize: initialize,
    get: get
}
