"use strict";

const Config = require('config');
const BPromise = require('bluebird');
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
    }
};