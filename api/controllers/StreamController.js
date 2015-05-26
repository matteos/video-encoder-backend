/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    add: function(req, res) {
        var json = req.body;
        json.forEach(function(j) {
            Stream.create(j).exec(function(err, stream) {
               sails.log.debug("created stream "+stream.id); 
            });
        });
        
        res.send(200);
    },
};

