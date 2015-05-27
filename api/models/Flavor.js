/**
 * Flavor.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        entry: {
            model: 'entry'
        },
        preset: {
            model: 'preset'
        },
        status: {
            type: 'string',
            enum: ['ready', 'error', 'processing', 'queued', 'done'],
            defaultsTo: 'ready'
        },
        type: {
            type: 'string',
            enum: ['stream', 'file'],
            defaultsTo: 'file'
        },
        metadata: {
            model: 'metadata'
        },
        file: {
            model: 'source'
        },
        stream: {
            model: 'stream'
        },
        update: function(cb) {
            var id = this.id;
            var self = this;
            Flavor.update(id, self).exec(function(err, e) {
                if (typeof (cb) !== 'undefined') {
                    cb(err, e);
                } else {
                    return e;
                }

            });
        },
        hasFile: function() {
            return this.type === 'file';
        },
        hasStream: function() {
            return this.type === 'stream';
        },
        isReady: function() {
            return this.status === 'ready';
        },
        isError: function() {
            return this.status === 'error';
        },
        isProcessing: function() {
            return this.status === 'processing';
        },
        isQueued: function() {
            return this.status === 'queued';
        }
    },
    signal: function(id, status, cb) {
        Flavor.update(id, {status: status}).exec(function(err, e) {
            if (typeof (cb) !== 'undefined') {
                cb(err, e);
            } else {
                return e;
            }

        });
    },
    status: function(id, cb) {
        Flavor.findOne(id).exec(function(err, flavor) {
            if (!err && flavor) {
                cb(null, flavor.status);
            } else {
                cb(err, null);
            }
        });

    },
    get: function(id, cb) {
        Flavor.findOne(id).populateAll().exec(function(err, flavor) {
            cb(err, flavor);
        });
    },
    process: function(id, cb) {
        Flavor.get(id, function(err, flavor) {
            if (!err && flavor) {
                sails.log.debug("get flavor " + id);
                Entry.source(flavor.entry.id, function(err2, source) {
                    if (!err2 && source) {
                        sails.log.debug("process flavor " + id + " source " + source);
                        var profile = flavor.preset;

                        var relay = null;

                        var output = "";
                        if (flavor.hasFile() && flavor.file !== null) {
                            output = flavor.file.path();
                        }
                        if (flavor.hasStream() && flavor.stream !== null) {
                            output = flavor.stream.url;
                            relay = flavor.stream;
                        }

                        profile.output = output;

//                        sails.log.debug(profile);
                        FFmpegService.process('flavor-' + flavor.id, source, [profile], function(res) {
                            sails.log.debug(res);
                        });

                        cb(null, flavor);
                    } else {
                        cb(err2, null);
                    }
                });
            } else {
                cb(err);
            }
        });
    }
};

