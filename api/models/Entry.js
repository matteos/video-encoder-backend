/**
 * Entry.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        title: {
            type: 'string',
            defaultsTo: ''
        },
        partner: {
            model: 'partner'
        },
        type: {
            type: 'string',
            enum: ['stream', 'file'],
            defaultsTo: 'file'
        },
        status: {
            type: 'string',
            enum: ['ready', 'error', 'uploading', 'processing', 'queued', 'done'],
            defaultsTo: 'uploading'
        },
        file: {
            model: 'source'
        },
        stream: {
            model: 'stream'
        },
        mimeType: {
            type: 'string',
            defaultsTo: ''
        },
        metadata: {
            model: 'metadata'
        },
        flavors: {
            collection: 'flavor',
            via: 'entry'
        },
        concurrent: {
            type: 'boolean',
            defaultsTo: false
        },
        /*
         * Methods
         */
        update: function(cb) {
            var id = this.id;
            var self = this;
            Entry.update(id, self).exec(function(err, e) {
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
        isUploading: function() {
            return this.status === 'uploading';
        },
        isProcessing: function() {
            return this.status === 'processing';
        },
        isQueued: function() {
            return this.status === 'queued';
        },
        isDone: function() {
            return this.status === 'done';
        },
        isConcurrent: function() {
            return this.concurrent;
        }
    },
    /*
     * Static methods
     */
    status: function(id, status) {
        Entry.findOne(id).exec(function(err, entry) {
            if (!err && entry) {
                Entry.update(id, {status: status}).exec(function(err2, e) {
                });
            }
        });

    },
    get: function(id, cb) {
        Entry.findOne(id).populateAll().exec(function(err, entry) {
            cb(err, entry);
        });
    },
    inspect: function(id, cb) {
        Entry.get(id, function(err, entry) {
            if (!err && entry) {

                var source = "";
                if (entry.hasFile() && entry.file !== null) {
                    source = entry.file.path();
                }
                if (entry.hasStream() && entry.stream !== null) {
                    source = entry.stream.url;
                }
                if (source !== '') {
                    FFmpegService.inspect(source, function(err3, metadata) {
                        if (!err3 && metadata) {
                            entry.metadata = metadata.id;
                            entry.update();
                        }
                        sails.log.debug("return meta");
                        sails.log.debug(metadata);
                        cb(err3, metadata);

                    });
                } else {
                    cb('error');
                }

            } else {
                cb(err);
            }
        });
    },
    process: function(id, cb) {
        Entry.get(id, function(err, entry) {
            if (!err && entry) {

                sails.log.debug(entry);

                var source = "";
                if (entry.hasFile() && entry.file !== null) {
                    source = entry.file.path();
                }
                if (entry.hasStream() && entry.stream !== null) {
                    source = entry.stream.url;
                }

                if (entry.status !== 'processing' && source !== '') {
                    sails.log.debug("do process ");
                    Flavor.find({entry: id}).populateAll().exec(function(err, flavors) {
                        //check if execution is concurrent
                        if (!entry.isConcurrent()) {

                            flavors.forEach(function(flavor) {
                                sails.log.debug("call process for flavor " + flavor.id);
                                Flavor.process(flavor.id, function(err3, flavor) {
                                });

                            });
                        } else {
                            //fetch data and prepare ffmpeg
                            var profiles = [];

                            flavors.forEach(function(flavor) {
                                var profile = flavor.preset;

                                var output = "";
                                if (flavor.hasFile() && flavor.file !== null) {
                                    output = flavor.file.path();
                                }
                                if (flavor.hasStream() && flavor.stream !== null) {
                                    output = flavor.stream.url;
                                }

                                profile.output = output;

                                //add to list
                                profiles.push(profile);
                            });

                            FFmpegService.process(source, profiles, function(res) {
                                sails.log.debug(res);
                            });
                        }
                    });
                }

                cb(null, entry);
            } else {
                cb(err, null);
            }
        });

    },
    source: function(id, cb) {
        Entry.get(id, function(err, entry) {
            if (!err && entry) {
                var source = "";
                if (entry.hasFile() && entry.file !== null) {
                    source = entry.file.path();
                }
                if (entry.hasStream() && entry.stream !== null) {
                    source = entry.stream.url;
                }
                cb(null, source);
            } else {
                cb(err, null);
            }
        });
    }
};

