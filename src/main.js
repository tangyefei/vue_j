var config      = require('./config'),
    Seed        = require('./seed')

var controllers = config.controllers,
    api         = {}

// API


api.controller = function (id, extensions) {
    if (!extensions) return controllers[id]
    if (controllers[id]) {
        console.warn('controller "' + id + '" already exists and has been overwritten.')
    }
    controllers[id] = extensions
}

api.bootstrap = function () {
    var el = document.querySelector('[' + config.prefix + '-controller]');
    return (new Seed(el))
}

module.exports = api