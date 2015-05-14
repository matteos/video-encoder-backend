/**
 * Log.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        type: {
            type: 'string',
            enum: ['entry', 'file', 'flavor', 'job']
        },
        action: {
            type: 'string',
            enum: ['create', 'delete', 'update', 'upload', 'enqueue', 'process', 'error']
        },
        entryId: {
            type: 'string'
        },
        message: {
            type: 'message'
        }
    }
};

