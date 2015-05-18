/**
 * Schedule Service
 *
 * @module      :: Service
 * @description :: service
 */
var scheduler = require('node-schedule');

// ScheduleService.js - in api/services
module.exports = {
    schedules: {},
    /*
     * methods
     */
    isScheduled: function(id) {
//        sails.log.debug("isRunning");
//        sails.log.debug(Object.keys(FFmpegService.processes));

        return ScheduleService.schedules.hasOwnProperty(id);
    },
    schedule: function(id, start, end) {
        var now = new Date();

        var idStart = id + "_start";
        var idEnd = id + "_end";

        //clear previous entry
        ScheduleService.clear(id);

        if (start > now) {
            ScheduleService.schedules[idStart] = scheduler.scheduleJob(id, start, function() {
                sails.log.debug("schedule start callback " + id);
                Schedule.start(id, function(err, schedule) {
                });
            });
            if (end !== 'undefined' && end > now) {
                ScheduleService.schedules[idEnd] = scheduler.scheduleJob(id, end, function() {
                    sails.log.debug("schedule end callback " + id);
                    Schedule.stop(id, function(err, schedule) {
                    });
                });
            }
        }





    },
    clear: function(id) {
        var idStart = id + "_start";
        var idEnd = id + "_end";

        if (ScheduleService.isScheduled(idStart)) {
            var s = ScheduleService.schedules[idStart];
            s.cancel();
            delete ScheduleService.schedules[idStart];
        }

        if (ScheduleService.isScheduled(idEnd)) {
            var s = ScheduleService.schedules[idEnd];
            s.cancel();
            delete ScheduleService.schedules[idEnd];
        }

    }
};