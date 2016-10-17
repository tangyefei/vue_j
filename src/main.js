var app = {},
    Seed = require("./seed"),
    config = require("./config"),
    controllers = config.controllers;

app.controller = function(name, fn) {
    controllers[name] = fn;
}

app.bootstrap = function(el) {
    if(typeof el === 'string') {
        el = document.querySelector(el);
        new Seed(el,{
            parentScope: null,
            scope: null,
            root: true
        });
    }
}

module.exports = app