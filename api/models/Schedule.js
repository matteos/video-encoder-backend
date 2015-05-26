/**
 * Schedule.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        entry: {
            model: 'entry'
        },
        dateStart: {
            type: 'datetime',
            required: true
        },
        dateEnd: {
            type: 'datetime',
            required: false
        },
        status: {
            type: 'string',
            enum: ['ready', 'scheduled', 'error', 'processing', 'done'],
            defaultsTo: 'ready'
        },
        isReady: function() {
            return this.status === 'ready';
        },
        isError: function() {
            return this.status === 'error';
        },
        isScheduled: function() {
            return this.status === 'scheduled';
        },
        isProcessing: function() {
            return this.status === 'processing';
        },
        isDone: function() {
            return this.status === 'done';
        }
    },
    signal: function(id, status, cb) {
        Schedule.update(id, {status: status}).exec(function(err, e) {
            if (typeof (cb) !== 'undefined') {
                cb(err, e);
            } else {
                return e;
            }

        });
    },
    status: function(id, cb) {
        Schedule.findOne(id).exec(function(err, entry) {
            if (!err && entry) {
                cb(null, entry.status);
            } else {
                cb(err, null);
            }
        });

    },
    get: function(id, cb) {
        Schedule.findOne(id).populateAll().exec(function(err, entry) {
            cb(err, entry);
        });
    },
    schedule: function(id, cb) {
        Schedule.findOne(id).exec(function(err, schedule) {
            if (!err && schedule) {
                sails.log.debug("schedule event " + id);
                var now = new Date();
                var start = new Date(Date.parse(schedule.dateStart));
                var end = new Date(Date.parse(schedule.dateEnd));

                //check start date > now
                if (start > now) {
                    ScheduleService.schedule(id, start, end);
                    schedule.status = 'scheduled';
                    Schedule.signal(schedule.id, schedule.status);
                }
                cb(null, schedule);
            } else {
                cb(err, null);
            }
        });

    },
    clear: function(id, cb) {
        Schedule.findOne(id).exec(function(err, schedule) {
            if (!err && schedule) {
                sails.log.debug("clear event " + id);

                ScheduleService.clear(id);
                schedule.status = 'ready';
                Schedule.signal(schedule.id, schedule.status);
                cb(null, schedule);
            } else {
                cb(err, null);
            }
        });

    },
    start: function(id, cb) {
        Schedule.get(id, function(err, schedule) {
            if (!err && schedule && schedule.entry) {
                sails.log.debug("schedule start " + id);

                Entry.process(schedule.entry.id, function(err2, entry) {
                    schedule.status = 'processing';
                    Schedule.signal(schedule.id, schedule.status);
                    cb(null, schedule);
                });

            } else {
                cb(err, null);
            }
        });

    },
    stop: function(id, cb) {
        Schedule.get(id, function(err, schedule) {
            if (!err && schedule && schedule.entry) {
                sails.log.debug("schedule stop " + id);

                Entry.stop(schedule.entry.id, function(err2, entry) {
                    schedule.status = 'done';
                    Schedule.signal(schedule.id, schedule.status);
                    cb(null, schedule);
                });
            } else {
                cb(err, null);
            }
        });

    },
};

