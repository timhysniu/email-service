var config = require('config');
var nylas = require('nylas');
var _ = require('underscore');
var app = require('../server');
var nylasClient = require('../lib/nylas.js');

var data = {
    config: config
};
var internals = {};

nylas.config({
    appId: config.nylas.KEY,
    appSecret: config.nylas.SECRET
});

internals.getThreadData = function(thread) {
    let obj = {
        id: thread.id,
        snippet: thread.snippet,
        subject: thread.subject,
        unread: thread.unread,
        lastMessageTimestamp: thread.lastMessageTimestamp
    };

    var participants = [];
    _.each(thread.participants, function(participant) {
        if(participant.email !== config.app.participant.email) {
            participants.push(participant.name);
        }
    });

    obj.participants = participants.join(', ');

    return obj;
};

module.exports = {
    home: function (request, reply) {

        // views
        data.views = request.session.views;
        request.session.views = request.session.views + 1 || 1;

        // check token
        var token = request.session.token;
        if(_.isEmpty(token)) {
            let options = {
                redirectURI: config.app.server.baseUrl + 'login',
                trial: false
            };

            return reply.redirect(nylas.urlForAuthentication(options));
        }

        console.log("Home Token: ", token);

        // pull threads
        var params = {
            token: token,
            page: 1,
            size: 10
        };

        nylasClient.getThreads(params).then(function(response) {
            let threads = response.threads;
            data.threads = [];
            _.each(threads, function(thread) {
                data.threads.push(internals.getThreadData(thread));
            });

            console.log(data.threads);
            reply.view('index', data);
        });


    },

    login: function(request, reply) {
        if (request.query.code) {
            nylas.exchangeCodeForToken(request.query.code).then(function(token) {
                console.log("Login Code: ", request.query.code);
                console.log("Login Token: ", token);

                request.session.token = token;

                reply.redirect('/');
            });
        } else if (request.query.error) {
            console.error(new Error(request.query.error));
            return reply.redirect('/');
        }
    },

    about: function (request, reply) {
        reply.view('about', data);
    }
};


//{
//    path: '/email/connect',
//        method: 'GET',
//    handler: function (request, reply) {
//    let options = {
//        redirectURI: 'http://thysniu01vl:8000/email/oauth/callback',
//        trial: false
//    };
//    return reply.redirect(Nylas.urlForAuthentication(options));
//},
//    config: {
//        auth: false,
//            tags: ['api', 'email', 'note'],
//            description: 'Test api endpoint for email'
//    }
//},
//{
//    path: '/email/oauth/callback',
//        method: 'GET',
//    handler: function (request, reply) {
//    if (request.query.code) {
//        Nylas.exchangeCodeForToken(request.query.code).then(function(token) {
//            console.log("Code", request.query.code);
//            console.log("Token:", token);
//            return reply(server.app.renderView('redirect', { url: '/' })).state('nylas', token);
//        });
//    } else if (request.query.error) {
//        global.move.log.error(new Error(request.query.error));
//        return reply.redirect('/');
//    }
//},
//    config: {
//        validate: {
//            query: {
//                code: joi.string(),
//                    page: joi.number().integer().min(1).max(999).default(1, 'selected page'),
//                    size: joi.number().integer().min(5).max(100).default(10, 'page size'),
//                    error: joi.string()
//            }
//        },
//        auth: false,
//            tags: ['api', 'email', 'note'],
//            description: 'Test api endpoint for email'
//    }