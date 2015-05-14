/**
 * Preset.js
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
        partner: {
            model: 'partner'
        },
        type: {
            type: 'string',
            enum: ['web', 'mobile','desktop','copy'],
            defaultsTo: 'web'
        },
        format: {
            type: 'string',
            defaultsTo: ''
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
        videoOptions: {
            type: 'string',
            defaultsTo: ''
        },
        videoFilters: {
            type: 'string',
            defaultsTo: ''
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
        audioOptions: {
            type: 'string',
            defaultsTo: ''
        },
        audioFilters: {
            type: 'string',
            defaultsTo: ''
        },
        ffmpegOptions: {
            type: 'string',
            defaultsTo: ''
        },
        inputOptions: {
            type: 'string',
            defaultsTo: ''
        },
        nativeFramerate: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

