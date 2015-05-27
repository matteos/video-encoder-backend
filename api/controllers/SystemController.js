/**
 * SystemController
 *
 * @description :: Server-side logic for managing systems
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var usage = require('usage');
var os = require('os');
var running = require('is-running');

module.exports = {
    status: function(req, res) {
        var now = new Date();
        Entry.count({status: 'processing'}).exec(function(err, numEntry) {
            Flavor.count({status: 'processing'}).exec(function(err, numFlavor) {
                Schedule.count({status: 'scheduled', dateEnd: {'>': now}}).exec(function(err, numSchedule) {
                    var status = {entries: numEntry,
                        flavors: numFlavor,
                        schedules: numSchedule};

                    return res.json(status);
                });
            });
        });
    },
    info: function(req, res) {
        var status = {
            'hostname': os.hostname(),
            'arch': os.arch(),
            'platform': os.platform(),
            'type': os.type(),
            'release': os.release(),
            'uptime': os.uptime(),
            'loadavg': os.loadavg(),
            'totalmem': os.totalmem(),
            'freemem': os.freemem(),
            'cpus': os.cpus(),
            'networkInterfaces': os.networkInterfaces()

        };
        // Send a JSON response
        return res.json(status);
    },
    network: function(req, res) {

        // Send a JSON response
        return res.json(os.networkInterfaces());
    },
    load: function(req, res) {

        // Send a JSON response
        return res.json(os.loadavg());
    },
    memory: function(req, res) {
        var mem = {
            'totalmem': os.totalmem(),
            'freemem': os.freemem()
        };
        // Send a JSON response
        return res.json(mem);
    },
    usage: function(req, res) {
        var pid = process.pid;
        usage.lookup(pid, function(err, result) {

            // Send a JSON response
            return res.json(result);
        });

    },
    process: function(req, res) {
        var pid = parseInt(req.param("pid", 0));
        if (pid > 0) {
            var active = running(pid);
            if (active) {
                usage.lookup(pid, function(err, result) {

                    // Send a JSON response
                    return res.json(result);
                });
            } else {
                res.send(404);
            }
        } else {
            res.send(404);
        }

    }
};

