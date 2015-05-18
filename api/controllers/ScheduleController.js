/**
 * ScheduleController
 *
 * @description :: Server-side logic for managing schedules
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    schedule: function(req, res) {
        var id = req.param('id', "");
        Schedule.schedule(id, function(err, schedule) {
            if (!err && schedule) {
                res.send(200);
            } else {
                res.send(500);
            }
        });

    },
    status: function(req, res) {
        var id = req.param('id', "");
        Schedule.status(id, function(err, status) {
            if (!err && status) {
                res.send(status);
            } else {
                res.send(500);
            }
        });

    },
};

