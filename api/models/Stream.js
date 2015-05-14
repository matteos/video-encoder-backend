/**
 * Stream.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        name: {
            type: 'string',
            defaultsTo: ''
        },
        url: {
            type: 'string',
            defaultsTo: ''
        },
        status: {
            type: 'string',
            enum: ['available', 'error', 'active']
        },
        mimeType: {
            type: 'string',
            defaultsTo: ''
        },
        keepAlive: {
            type: 'boolean',
            defaultsTo: 'false'
        },
        isAvailable: function() {
            return this.status === 'available';
        },
        isError: function() {
            return this.status === 'error';
        },
        isActive: function() {
            return this.status === 'active';
        }
    },
    status: function(id, status) {
        Stream.findOne(id).exec(function(err, stream) {
            if (!err && stream) {
                Stream.update(id, {status: status}).exec(function(err2, e) {
                });
            }
        });

    },
};

