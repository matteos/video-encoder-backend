/**
 * FFmpeg Service
 *
 * @module      :: Service
 * @description :: service
 */
var ffmpeg = require('fluent-ffmpeg');
//var running = require('is-running');

// FFmpegService.js - in api/services
module.exports = {
    process: function(source, profiles, callback) {
        sails.log.debug('callffmpeg process for ' + source);
        sails.log.debug(profiles);
        var command = ffmpeg(source);

        //parse input options, all applied to command
        var inputOptions = [];
        var nativeFramerate = false;
        profiles.forEach(function(profile) {
            if (profile.inputOptions !== '') {
                inputOptions.push(profile.inputOptions);
            }
            if (profile.nativeFramerate === true) {
                nativeFramerate = true;
            }
        });
        command.inputOptions(inputOptions);

        //set native framerate reading if required
        if (nativeFramerate) {
            command.native();
        }

        //add outputs
        profiles.forEach(function(profile) {
            command.output(profile.output);
            if (profile.format !== '') {
                command.format(profile.format);
            }
            command.outputOptions(profile.ffmpegOptions);

            if (profile.videoCodec !== '') {
                var width = (profile.videoWidth === 0) ? '?' : profile.videoWidth;
                var height = (profile.videoHeight === 0) ? '?' : profile.videoHeight;
                var size = width + 'x' + height;

                command.videoCodec(profile.videoCodec);

                if (profile.videoCodec !== 'copy') {
                    command
                            .videoBitrate(profile.videoBitrate + 'k')
                            .size(size);

                    if (profile.videoFilters !== '') {
                        command.videoFilters(profile.videoFilters);
                    }
                }

            } else {
                command.noVideo();
            }


            if (profile.audioCodec !== '') {
                command.audioCodec(profile.audioCodec);


                if (profile.audioCodec !== 'copy') {
                    command
                            .audioBitrate(profile.audioBitrate)
                            .audioChannels(profile.audioChannels)
                            .audioFrequency(profile.audioFrequency);

                    if (profile.audioFilters !== '') {
                        command.audioFilters(profile.audioFilters);
                    }
                }
            } else {
                command.noAudio();
            }

        });

        //event handlers
        command
                .on('start', function(commandLine) {
                    sails.log.debug('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('error', function(err, stdout, stderr) {
                    sails.log.debug('Cannot process video: ' + err.message);
                    callback('error');
                })
                .on('end', function() {
                    sails.log.debug('Transcoding succeeded !');
                    callback('done');
                });

        //run
        command.run();



    },
    probe: function(uri, callback) {
        sails.log.debug('callffmpeg probe');
        ffmpeg.ffprobe(uri, function(e, metadata) {
            sails.log.debug(metadata);
            //return 
            if (typeof (callback) !== 'undefined') {
                callback(metadata);
            } else {
                return metadata;
            }
        });
    },
    inspect: function(uri, callback) {
//        sails.log.debug('callffmpeg inspect');
        ffmpeg.ffprobe(uri, function(e, result) {
            if (result.hasOwnProperty('format') && result.hasOwnProperty('streams')) {

                var streams = result.streams;
                var video = null;
                var audio = null;
                for (var i in streams) {
                    var s = streams[i];
                    if (s.codec_type === 'video') {
                        video = s;
                    } else if (s.codec_type === 'audio') {
                        audio = s;
                    }
                }

                //create metadata object
                var m = {
                    format: result.format.tags.major_brand,
                    duration: result.format.duration,
                    bitrate: result.format.bit_rate,
                    raw: result
                };
                if (video !== null) {
                    m.videoCodec = video.codec_name;
                    m.videoBitrate = video.bit_rate;
                    m.videoHeight = video.height;
                    m.videoWidth = video.width;
                }
                if (audio !== null) {
                    m.audioCodec = audio.codec_name;
                    m.audioBitrate = audio.bit_rate;
                    m.audioChannels = audio.channels;
                    m.audioFrequency = audio.sample_rate;
                }

                Metadata.create(m).exec(function(err, metadata) {
//                    sails.log.debug("metadata dump");
//                    sails.log.debug(metadata);

                    //return 
                    if (typeof (callback) !== 'undefined') {
                        callback(err, metadata);
                    } else {
                        return metadata;
                    }
                });
            } else {
                //return 
                if (typeof (callback) !== 'undefined') {
                    callback(true, null);
                } else {
                    return 500;
                }
            }



        });
    },
};