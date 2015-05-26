/**
 * EntryController
 *
 * @description :: Server-side logic for managing entries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var fs = require('fs');
var _ = require('lodash');

module.exports = {
    /*
     * Entry
     */
    //WILL OVERRIDE BLUEPRINT
//    create: function(req, res) {
//        sails.log.debug("entry create");
//        var entry = Entry.definition;
//        res.send(entry);
//    },
    add: function(req, res) {
        var json = req.body;
        json.forEach(function(j) {
            Entry.create(j).exec(function(err, entry) {
                sails.log.debug("created entry " + entry.id);
            });
        });

        res.send(200);

    },
    get: function(req, res) {
        var id = req.param('id', "");
        Entry.get(id, function(err, entry) {
            if (!err && entry) {
                return res.json(entry);
            } else {
                res.send(404);
            }
        });

    },
    detail: function(req, res) {
        var id = req.param('id', "");
        Entry.findOne(id)
                .populateAll()
                .then(function(entry) {
                    var flavorStreams = Stream.find({
                        id: _.pluck(entry.flavors, 'stream')
                                //_.pluck: Retrieves the value of a 'user' property from all elements in the post.comments collection.
                    })
                            .then(function(flavorStreams) {
                                return flavorStreams;
                            });
                    return [entry, flavorStreams];
                })
                .spread(function(entry, flavorStreams) {
                    var flavorStreams = _.indexBy(flavorStreams, 'id');
                    //_.indexBy: Creates an object composed of keys generated from the results of running each element of the collection through the given callback. The corresponding value of each key is the last element responsible for generating the key
                    entry.flavors = _.map(entry.flavors, function(flavor) {
                        flavor.stream = flavorStreams[flavor.stream];
                        return flavor;
                    });
                    res.json(entry);
                })
                .catch(function(err) {
                    if (err) {
                        return res.serverError(err);
                    }
                });

    },
    //WILL OVERRIDE BLUEPRINT
//    update: function(req, res) {
//        sails.log.debug("entry update");
//
//    },
//    remove: function(req, res) {
//        sails.log.debug("entry remove");
//
//    },
//    
//    //DISABLED
//    /**     
//     * Upload file(s) to the server's disk.
//     */
//    upload: function(req, res) {
//        var id = req.param('id', "");
//        Entry.findOne(id).exec(function(err, entry) {
//            if (!err && entry) {
//                entry.type = 'file';
//
//                Source.create({status: 'uploading'}).exec(function(err2, source) {
//
//
//                    entry.sourceId = source.id;
//                    //save
//                    entry.update();
//
////                    sails.log.debug(source);
//                    // e.g.
//                    // 0 => infinite
//                    // 240000 => 4 minutes (240,000 miliseconds)
//                    // etc.
//                    //
//                    // Node defaults to 2 minutes.
//                    res.setTimeout(0);
//                    req.file('file')
//                            .upload({
//                                maxBytes: 1000000
//                            }, function whenDone(err3, uploadedFiles) {
//                                if (err3) {
//                                    source.status = 'error';
//                                    source.save(function(e, s) {
//                                        return res.serverError(err3);
//                                    });
//                                } else {
//                                    var f = uploadedFiles[0];
//                                    //move file
//                                    fs.rename(f.fd, source.path(), function(err4) {
//                                        source.size = f.size;
//                                        source.mimeType = f.type;
//                                        source.name = f.filename;
//                                        source.status = 'available';
//                                        source.save();
//
//                                        return res.json(source);
//                                    });
////                                    sails.log.debug('file');
////                                    sails.log.debug(f);
//
//
//                                }
//                            });
////                            .on('progress', function(event) {
//////                        sails.log.debug(event);
//////                        sails.log.debug("progress");
////                            });
//                });
//            } else {
//                res.send(500);
//            }
//        });
//    },
//    /**
//     * Download a file from the server's disk.
//     */
//    download: function(req, res) {
//        var id = req.param('id', "");
//
//        Entry.get(id, function(err, entry) {
//            if (!err && entry) {
//
//                if (entry.type === 'file' && entry.sourceId !== '') {
//                    Source.findOne(entry.sourceId).exec(function(err2, source) {
//                        if (!err2 && source && source.status === 'available') {
//
//                            //set headers
//                            res.set('Content-Type', source.mimeType);
//                            res.set('Content-Length', source.size);
//
//                            //send data
//
//                            fs.createReadStream(source.path)
//                                    .on('error', function(err) {
//                                        return res.serverError(err);
//                                    })
//                                    .pipe(res);
//                        } else {
//                            res.send(500);
//                        }
//                    });
//
//                } else {
//                    res.send(406); //not acceptable
//                }
//
//
//            } else {
//                res.send(500);
//            }
//        });
//
//    },
    inspect: function(req, res) {
        var id = req.param('id', "");
        Entry.inspect(id, function(err, metadata) {
            if (!err && metadata) {
                return res.json(metadata);
            } else {
                res.send(500);
            }
        });

    },
    process: function(req, res) {
        var id = req.param('id', "");
        Entry.process(id, function(err, entry) {
            if (!err && entry) {
                res.send(200);
            } else {
                res.send(500);
            }
        });

    },
    status: function(req, res) {
        var id = req.param('id', "");
        Entry.status(id, function(err, status) {
            if (!err && status) {
                res.send(status);
            } else {
                res.send(500);
            }
        });

    },
    stop: function(req, res) {
        var id = req.param('id', "");
        Entry.stop(id, function(err, entry) {
            if (!err && entry) {
                res.send(200);
            } else {
                res.send(500);
            }
        });

    },
//    source: function(req, res) {
//        var id = req.param('id', "");
//        Entry.findOne(id).exec(function(err, entry) {
//            if (!err && entry) {
//                var s = {};
//                if (entry.type === 'file' && entry.sourceId !== '') {
//                    Source.findOne(entry.sourceId).exec(function(err, source) {
//                        if (!err && source) {
//                            return res.json(source);
//                        } else {
//                            res.send(500);
//                        }
//                    });
//                } else if (entry.type === 'stream' && entry.sourceId !== '') {
//                    Stream.findOne(entry.sourceId).exec(function(err, source) {
//                        if (!err && source) {
//                            return res.json(source);
//                        } else {
//                            res.send(500);
//                        }
//                    });
//                } else {
//                    res.send(404);
//                }
//            } else {
//                res.send(500);
//            }
//        });
//
//    },
};

