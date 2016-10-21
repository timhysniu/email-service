'use strict'
const config = require('config');
const nylas = require('nylas');
const _ = require('underscore');
const app = require('../server.js');
const nylasClient = require('../lib/nylas.js');

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

internals.getContactsFromThread = function(thread) {

    var contacts = [];
    _.each(thread.participants, function(p) {
        if(p.email !== config.agent.email) {
            contacts.push(p.name);
        }
    });

    return contacts.join(', ');
}


internals.getLastMessage = function(messages) {

    var lastMessage = {
        reply_to_message_id: '',
        thread_id: '',
        subject: '',
        to_email: '',
        to_name: ''
    };

    var message = _.find(messages, function(msg) {
        return (msg.folder == 'inbox');
    });

    if(! _.isEmpty(message)) {
        lastMessage.reply_to_message_id = message.id;
        lastMessage.thread_id = message.threadId;
        lastMessage.subject = message.subject;
        lastMessage.to_email = message.from[0].email;
        lastMessage.to_name = message.from[0].name;
    }

    return lastMessage;
}

module.exports = {

    home: function(request, reply) {
        GLOBAL.mc.get('foo', function (err, value, key) {
            if (value != null) {
                console.log('memcached output');
                console.log(value.toString());
            }
        });


        data.views = request.session.views;
        request.session.views = request.session.views + 1 || 1;

        reply.view('index', data);
    },

    notification: function(request, reply) {
        var response = { success: true };
        //io.on('connection', function (socket) {
        //    console.log('emitting updatePlayer')
        //    socket.broadcast.emit('updatePlayer', response);
        //});

        reply(response);
    },

    inbox: function (request, reply) {

        // check token
        var token = request.session.token;
        if(_.isEmpty(token)) {
            let options = {
                redirectURI: config.app.server.baseUrl + 'login',
                trial: false
            };

            return reply.redirect(nylas.urlForAuthentication(options));
        }

        console.log("Inbox Token: ", token);

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


            reply.view('inbox', data);
        });


    },

    login: function(request, reply) {
        if (request.query.code) {
            nylas.exchangeCodeForToken(request.query.code).then(function(token) {
                console.log("Login Code: ", request.query.code);
                console.log("Login Token: ", token);

                request.session.token = token;

                reply.redirect('/inbox');
            });
        } else if (request.query.error) {
            console.error(new Error(request.query.error));
            return reply.redirect('/');
        }
    },

    message: function(request, reply) {
        let params = {
            token: request.session.token,
            id: request.params.id
        };


        var messages = [];
        var data = [];
        nylasClient.getThreadDetails({
                token: request.session.token,
                id: request.params.id
            })
            .then(function(thread) {
                data.thread = thread;
                data.contacts = internals.getContactsFromThread(thread);
                return nylasClient.getThreadMessages({
                    threadId: thread.id,
                    messageIds: thread.messageIds,
                    token: request.session.token
                })
            })
            .then(function(messages) {
                data.messages = messages;
                data.last_message = internals.getLastMessage(messages);

                reply.view('message', data);
            })
            .catch(function(err) {
                console.log('could not fetch messages', err);
                reply.view('message', null);
            });
    },

    about: function (request, reply) {
        reply.view('about', data);
    },


    reply: function(request, reply) {
        console.log('payload.....');
        console.log(request.payload);

        let params = request.payload;
        params.token = request.session.token;

        nylasClient.sendReply(params)
            .then(function(response) {
                reply({success: true, data: response});
            })
            .catch(function(err) {
                reply({success: false, error: err});
            });


    }
};
