'use strict'
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

var inboxRoute = {
    method: 'GET',
    path: '/inbox',
    handler: function (request, reply) {
        app.controllers.index.inbox(request, reply);
    }
};

var messageRoute = {
    method: 'GET',
    path: '/inbox/{id}',
    handler: function (request, reply) {
        app.controllers.index.message(request, reply);
    }
};

var replyRoute = {
    method: 'POST',
    path: '/message/send',
    handler: function (request, reply) {
        app.controllers.index.reply(request, reply);
    }
}

var newMessageRoute = {
    method: 'GET',
    path: '/notification/message/new',
    handler: function (request, reply) {
        app.controllers.index.notification(request, reply);
    }
}

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
    loginRoute,
    inboxRoute,
    messageRoute,
    replyRoute,
    newMessageRoute,
    aboutRoute,
    assetsRoute,
];