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
        //DISABLED: LOSES ASSOCIATIONS
        //needs to update only fields
//        update: function(cb) {
//            var id = this.id;
//            var self = this;
//            Entry.update(id, self).exec(function(err, e) {
//                if (typeof (cb) !== 'undefined') {
//                    cb(err, e);
//                } else {
//                    return e;
//                }
//
//            });
//        },
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
    signal: function(id, status, cb) {
        Entry.update(id, {status: status}).exec(function(err, e) {
            if (typeof (cb) !== 'undefined') {
                cb(err, e);
            } else {
                return e;
            }

        });
    },
    status: function(id, cb) {
        Entry.findOne(id).exec(function(err, entry) {
            if (!err && entry) {
                cb(null, entry.status);
            } else {
                cb(err, null);
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
//                            entry.update(); TODO
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

//                sails.log.debug(entry);

                var source = "";
                if (entry.hasFile() && entry.file !== null) {
                    source = entry.file.path();
                }
                if (entry.hasStream() && entry.stream !== null) {
                    source = entry.stream.url;
                }

                if (!entry.isProcessing() && source !== '') {
                    sails.log.debug("do process ");
                    entry.status = 'processing';
                    Entry.signal(entry.id, entry.status);

                    Flavor.find({entry: id}).populate('preset').populate('file').populate('stream').exec(function(err, flavors) {
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
                            var keepAlive = false;

                            flavors.forEach(function(flavor) {
                                var profile = flavor.preset;

                                var output = "";
                                if (flavor.hasFile() && flavor.file !== null) {
                                    output = flavor.file.path();
                                }
                                if (flavor.hasStream() && flavor.stream !== null) {
                                    output = flavor.stream.url;
                                    //check for keepAlive on output stream
                                    if (flavor.stream.keepAlive) {
                                        keepAlive = true;
                                    }
                                }

                                profile.output = output;

                                //add to list
                                profiles.push(profile);
                            });

                            sails.log.debug("profiles ");
                            sails.log.debug(profiles);
                            if (profiles.length > 0) {
                                FFmpegService.process('entry-' + entry.id, source, profiles, function(res) {
                                    if (res === 'start') {
                                    } else if (res === 'end') {
                                        entry.status = 'done';
                                        Entry.signal(entry.id, entry.status);
                                    } else if (res === 'running') {
                                        //fix status
                                        entry.status = 'processing';
                                        Entry.signal(entry.id, entry.status);
                                    } else {
                                        //error
                                        sails.log.debug(res);
                                        if (keepAlive) {
                                            //wait 2s
                                            setTimeout(function() {
                                                Entry.get(id, function(err3, entry) {
                                                    if (entry.isProcessing()) {
                                                        //reset state to ready and restart
                                                        entry.status = 'ready';
                                                        Entry.signal(entry.id, entry.status, function(e) {
                                                            sails.log.debug("keepAlive, call process again");
                                                            Entry.process(entry.id, function() {
                                                            });
                                                        });
                                                    }
                                                });
                                            }, 2000);


                                        } else {
                                            //save error
                                            entry.status = 'error';
                                            Entry.signal(entry.id, entry.status);
                                        }



                                    }
                                });
                            } else {
                                //error no flavor available
                                entry.status = 'error';
                                Entry.signal(entry.id, entry.status);
                            }
                        }
                    });
                }

                cb(null, entry);
            } else {
                cb(err, null);
            }
        });

    },
    stop: function(id, cb) {
        Entry.get(id, function(err, entry) {
            if (!err && entry) {
                if (entry.isProcessing()) {
                    //stop
                    FFmpegService.stop('entry-' + entry.id, function(res) {
                        sails.log.debug(res);
                    });



                }

                //reset status 
                entry.status = 'ready';
                //update status
                Entry.signal(entry.id, entry.status);
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

