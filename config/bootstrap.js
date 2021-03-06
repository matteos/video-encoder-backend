/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {


    //scheduling
    Schedule.find().exec(function(err, list) {
        if (!err && list) {
            //add each schedule to scheduler if not in the past
            var now = new Date();
            list.forEach(function(schedule) {
                var start = new Date(Date.parse(schedule.dateStart));
                if (start > now && schedule.isScheduled()) {
                    Schedule.schedule(schedule.id, function(err, s) {
                    });
                }
            });
        }
    });

    //entries
    Entry.find().exec(function(err, list) {
        if (!err && list) {
            //check status and start if needed
            list.forEach(function(entry) {
                sails.log.debug("check entry " + entry.id + " status " + entry.status);
                if (entry.isProcessing()) {
                    sails.log.debug("resume processing " + entry.id);
                    //reset state to ready and restart
                    entry.status = 'ready';
                    Entry.signal(entry.id, entry.status, function() {
                        sails.log.debug("call process again");
                        setTimeout(function() {
                            Entry.process(entry.id, function() {
                            });
                        }, 1500);
                    });

                }
            });
        }
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
