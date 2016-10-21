"use strict";

const Config = require('config');
const BPromise = require('bluebird');
const _ = require('underscore');
const striptags = require('striptags');
const Nylas = require('nylas').config({
    appId: Config.nylas.KEY,
    appSecret: Config.nylas.SECRET
});

const internals = {};

internals.getOffset = function (page, size) {
    var result = 0;
    if (page > 1) {
        result = (page - 1) * size;
    }
    return result;
};


internals.trimMessages = function(messages) {
    var formatted = [];
    _.each(messages, function(message) {
        var obj = _.pick(message, 'unread', 'from', 'to', 'date', 'subject', 'body', 'id', 'threadId');
        obj.folder = message.folder.name;
        obj.body = striptags(obj.body, ['br', 'strong', 'b']);
        formatted.push(obj);
    });

    formatted = formatted.reverse();

    return formatted;
};

// http://nylashackathon-env.us-west-2.elasticbeanstalk.com

/**
 * Repository client for example widget
 *
 * @class Repository
 * @constructor
 */
module.exports = {

    /**
     * Returns threads of converstations from nylas
     *
     * @method getThreads
     * @param {object} params - object
     * @param {string} params.token
     * @param {number} params.page
     * @param {number} params.size
     * @return {Promise} object
     */
    getThreads : function (params) {
        params.page = params.page === undefined ? 1 : params.page;
        params.size = params.size === undefined ? 10 : params.size;
        return new BPromise(function(resolve, reject) {
            let nylas = Nylas.with(params.token);
            let offset = internals.getOffset(params.page, params.size);
            nylas.threads.list({ offset: offset, limit: params.size }).then((threads) => {
                let result = {
                    paging: {
                        page: params.page,
                        size: params.size,
                    },
                    threads: threads
                };
                return resolve(result);
            }).catch(reject);
        });
    },


    getThreadDetails : function(params) {
        return new BPromise(function(resolve, reject) {
            let nylas = Nylas.with(params.token);

            nylas.threads.find(params.id).then((thread) => {
                return resolve(thread);
            }).catch(reject);
        });
    },

    getThreadMessages : function(params) {
        return new BPromise(function(resolve, reject) {
            let nylas = Nylas.with(params.token);

            nylas.messages.list({thread_id: params.threadId}).then((messages) => {
                messages = internals.trimMessages(messages);
                console.log(JSON.stringify(messages));
                return resolve(messages);
            }).catch(reject);

        });
    },

    sendReply : function(params) {
        return new BPromise(function(resolve, reject) {
            let nylas = Nylas.with(params.token);

            var draft = nylas.drafts.build({
                subject: params.subject,
                to: [{email: params.to_email, name: params.to_name}],
                replyToMessageId: params.reply_to_message_id,
                thread_id: params.thread_id,
                body: params.message
            });

            draft.send().then(function(draft) {
                console.log(draft.id + ' was sent');
                resolve(draft);

            }).catch(reject);

        });
    }
};