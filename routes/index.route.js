var _ = require('underscore');
var app = require('../server');

var homeRoute = {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        app.controllers.index.home(request, reply);
    }
};

var loginRoute = {
    method: 'GET',
    path: '/login',
    handler: function (request, reply) {
        app.controllers.index.login(request, reply);
    }
};


var aboutRoute = {
    method: 'GET',
    path: '/about',
    handler: function (request, reply) {
        app.controllers.index.about(request, reply);
    }
}

var assetsRoute = {
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.'
        }
    }
}

module.exports = [
    homeRoute,
    assetsRoute,
    aboutRoute,
    loginRoute
];