/**
 * Source.js// renamed to Source because of global namespace conflict with socket.io File
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var fs = require('fs');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            defaultsTo: ''
        },
        status: {
            type: 'string',
            enum: ['available', 'error', 'uploading', 'importing', 'processing']
        },
        size: {
            type: 'integer',
            defaultsTo: 0
        },
        mimeType: {
            type: 'string',
            defaultsTo: ''
        },
        path: function() {
            return sails.config.data.basePath + this.id;
        },
        isAvailable: function() {
            return this.status === 'available';
        },
        isError: function() {
            return this.status === 'error';
        },
        isUploading: function() {
            return this.status === 'uploading';
        },
        isImporting: function() {
            return this.status === 'importing';
        },
        isProcessing: function() {
            return this.status === 'processing';
        }
    },
    status: function(id, status) {
        Source.findOne(id).exec(function(err, source) {
            if (!err && source) {
                Source.update(id, {status: status}).exec(function(err2, e) {
                });
            }
        });

    },
    delete: function(id, callback) {
        Source.findOne(id).exec(function(err, source) {
            if (!err && source) {
                //remove entry
                Source.destroy({id: id}).exec(function(err, res) {

                    //check for filesystem
                    fs.exists(source.path(), function(exists) {
                        sails.log.debug("remove file " + source.path());
                        fs.unlink('/tmp/hello', function(err) {
                            if (!err) {
                                sails.log.debug("file " + source.path() + " removed");
                            }
                        });
                    });


                });

            }
        });
    }
};

