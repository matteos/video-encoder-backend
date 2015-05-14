/**
 * Metadata.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        format: {
            type: 'string',
            defaultsTo: ''
        },
        duration: {
            type: 'float',
            defaultsTo: 0.0
        },
        bitrate: {
            type: 'integer',
            defaultsTo: 0
        },
        videoCodec: {
            type: 'string',
            defaultsTo: ''
        },
        videoBitrate: {
            type: 'integer',
            defaultsTo: 0
        },
        videoHeight: {
            type: 'integer',
            defaultsTo: 0
        },
        videoWidth: {
            type: 'integer',
            defaultsTo: 0
        },
        videoSize: function() {
            return this.videoWidth + 'x' + this.videoHeight;
        },
        audioCodec: {
            type: 'string',
            defaultsTo: ''
        },
        audioBitrate: {
            type: 'integer',
            defaultsTo: 0
        },
        audioChannels: {
            type: 'integer',
            defaultsTo: 0
        },
        audioFrequency: {
            type: 'integer',
            defaultsTo: 0
        },
        raw: {
            type: 'json'
        }
    }
};

