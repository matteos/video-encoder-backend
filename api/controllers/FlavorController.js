/**
 * FlavorController
 *
 * @description :: Server-side logic for managing flavors
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
//    create: function(req, res) {
//        var entry = Flavor.definition;
//        res.send(entry);
//    },
    add: function(req, res) {
        var entryId = req.param('entryId', '');
        var type = req.param('type', 'file');
        var presetId = req.param('preset', '');
        var url = req.param('url', '');

        Entry.findOne(entryId).exec(function(err, entry) {
            if (!err && entry) {
                Preset.findOne(presetId).exec(function(err2, preset) {
                    if (!err2 && preset) {

                        Flavor.create({entry: entry.id, preset: presetId, type: type, status: 'processing'}).exec(function(err, flavor) {

                            var name = entry.title + "-" + preset.name;
                            //create dest
                            if (flavor.hasFile()) {
                                Source.create({name: name, status: 'processing'}).exec(function(err3, source) {
                                    if (!err3) {
                                        flavor.file = source.id;
                                        flavor.update();
                                    }
                                    return res.json(flavor);
                                });
                            } else {
                                Stream.create({name: name, status: 'available', url: url}).exec(function(err3, stream) {
                                    if (!err3) {
                                        flavor.stream = stream.id;
                                        flavor.update();
                                    }
                                    return res.json(flavor);
                                });
                            }

                        });

                    } else {
                        res.send(404);
                    }
                });
            } else {
                res.send(404);
            }
        });
    },
    get: function(req, res) {
        var id = req.param('id', "");
        Flavor.get(id, function(err, flavor) {
            if (!err && flavor) {
                return res.json(flavor);
            } else {
                res.send(404);
            }
        });

    },
//    update: function(req, res) {
//
//    },
//    remove: function(req, res) {
//
//    },
    list: function(req, res) {
        var entryId = req.param('entryId', '');
        Flavor.find({entry: entryId}).exec(function(err, flavors) {
            if (!err && flavors) {
//                flavors.forEach(function(flavor) {
//                    Flavor.get(flavor.id, function(err, f) {
//                        flavor = f;
//                    });
//                });
                return res.json(flavors);
            } else {
                res.send(500);
            }
        });
    },
//    download: function(req, res) {
//        var id = req.param('id', "");
//
//        Flavor.get(id, function(err, flavor) {
//            if (!err && flavor) {
//
//                if (flavor.type === 'file' && flavor.sourceId !== '') {
//                    Source.findOne(flavor.sourceId).exec(function(err2, source) {
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
        Flavor.inspect(id, function(err, metadata) {
            if (!err && metadata) {
                return res.json(metadata);
            } else {
                res.send(500);
            }
        });
    },
    process: function(req, res) {
        var id = req.param('id', "");
        Flavor.process(id, function(err, flavor) {
            if (!err && flavor) {
                res.send(200);
            } else {
                res.send(500);
            }
        });
    },
//    source: function(req, res) {
//        var id = req.param('id', "");
//        Flavor.findOne(id).exec(function(err, flavor) {
//            if (!err && flavor) {
//                if (flavor.type === 'file' && flavor.sourceId !== '') {
//                    Source.findOne(entry.sourceId).exec(function(err, source) {
//                        if (!err && source) {
//                            return res.json(source);
//                        } else {
//                            res.send(500);
//                        }
//                    });
//                } else if (flavor.type === 'stream' && flavor.sourceId !== '') {
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

