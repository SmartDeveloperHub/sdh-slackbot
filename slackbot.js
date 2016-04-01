/*

    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      This file is part of the Smart Developer Hub Project:
        http://www.smartdeveloperhub.org/
      Center for Open Middleware
            http://www.centeropenmiddleware.com/
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Copyright (C) 2015 Center for Open Middleware.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at
                http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
     limitations under the License.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
*/

var loadStartDate = new Date();
var log = null;

var init = function() {
    try {
        // global buyan
        const bunyan = require('bunyan');
        const PrettyStream = require('bunyan-prettystream');
    } catch (err) {
        console.error("Bot Error. bunyan logs problem: " + err);
    }
    try {
        // Set Config params
        require('./config');
    } catch (err) {
        console.error("Fatal BOT Error with config: " + err);
        setTimeout(function() {
            process.exit(0);
        }, 1000);
    }

    // Shut down function
    var gracefullyShuttinDown = function gracefullyShuttinDown() {
        log.warn('Shut down signal Received ');
        log.warn(" ! Shutting Down SDH-API manually.");
        setTimeout(function () {
            process.exit(0);
        }, 500);
    };
    // Set security handlers
    process.on('SIGINT', gracefullyShuttinDown);
    process.on('SIGTERM', gracefullyShuttinDown);

    process.on('uncaughtException', function (err) {
        log.error(err);
        log.warn("Something is wrong, but SDH will continue on line");
    });

    if (!SLACK_BOT_TOKEN) {
        log.error('SLACK_BOT_TOKEN not found');
        gracefullyShuttinDown();
        return;
    }

    require('./utils/log')(FILE_LOG_PATH, FILE_LOG_LEVEL, FILE_LOG_PERIOD, FILE_LOG_NFILES).then(function (_log) {
        log = _log;
        startBOT();
    });
};

var getSlackMembers = function getSlackMembers(callback) {
    bot.api.users.list({}, function(err, res) {
        if (err) {
            log.error(err);
            return;
        }
        log.info("Slack Users List:");
        log.info(JSON.stringify(res.members)); // Array
        callback(res.members);
    });
};

var startBOT = function startBOT () {
    log.info("... Loading Modules...");
    try {
        GLOBAL.moment = require("moment");
        GLOBAL.request = require('request');
    } catch (err) {
        log.error(" ! Error loading dependencies: " + err);
        log.info('Exiting...');
        setTimeout(function () {
            process.exit(0);
        }, 500);
    }
    log.info('...starting...');

    // Create a new logger
    var corelog = log.child({in: 'core'});

    require('sdh-core-bot')("<@USLACKBOT>", 'https://sdh.conwet.fi.upm.es/sdhapi', 'https://sdh.conwet.fi.upm.es/', corelog).then(function(sdhBot) {

        GLOBAL.sdhBot = sdhBot;

        sdhBot.getSDHMembers(function(sdhMembers) {
            // Launching SlackBot
            launchSlackBot(function() {
                log.info('... slackbot Listenen! ...');
                bot.getSlackMembers(function(slackMembers) {
                    log.info("SDH Members List:");
                    log.info(JSON.stringify(sdhMembers)); // Array
                    log.info("SLACK Members List:");
                    log.info(JSON.stringify(slackMembers)); // Array

                    GLOBAL.usersBySlackId = {};
                    GLOBAL.usersBySDHId = {};
                    GLOBAL.usersByNick = {};
                    // Pointers. Read Only
                    GLOBAL.knownUsers = [];
                    GLOBAL.knownUsersBySlackId = {};
                    // Ids relationship for sdh-core-bot {slack-userTag-in-msg: sdhId}
                    var idRel = {};

                    for (var i = 0; i < slackMembers.length; i++) {
                        var mi = slackMembers[i];
                        if (mi.deleted) {
                            continue;
                        }
                        var u = {
                            slack_name: mi.name,
                            slack_id: mi.id,
                            slack_team_id: mi.team_id,
                            slack_first_name: mi.profile.first_name,
                            slack_last_name: mi.profile.last_name,
                            slack_real_name: mi.profile.real_name_normalized,
                            slack_avatar: mi.profile.image_192, // image_original is optional... gravatar etc
                            slack_email: mi.profile.email,
                            slack_color: mi.color
                        };
                        usersBySlackId[mi.id] = u;
                        usersByNick[mi.name] = u;
                    }
                    for (var z = 0; z < sdhMembers.length; z++) {
                        var mix = false;
                        var mi = sdhMembers[z];
                        // position
                        var pos;
                        switch (mi.positionsByOrgId[1][0]) { // By de moment only 1 org and only 1 position for each org
                            case 1 :
                                pos = 'Director';
                                break;
                            case 2 :
                                pos = "Product Manager";
                                break;
                            case 3 :
                                pos = "Architect";
                                break;
                            case 4 :
                                pos = "Developer";
                                break;
                            default:
                                pos = "Unknown";
                                break;
                        };

                        if (mi.nick in usersByNick) {
                            // SDH & Slack user !! Mixing...
                            mix = true;
                            var mis = usersByNick[mi.nick];
                            usersBySDHId[mi.userid] = {
                                slack_name: mis.slack_name,
                                slack_id: mi.slack_id,
                                slack_team_id: mis.slack_team_id,
                                slack_first_name: mis.slack_first_name,
                                slack_last_name: mis.slack_last_name,
                                slack_real_name: mis.slack_real_name,
                                slack_avatar: mis.slack_avatar,
                                slack_email: mis.slack_email,
                                slack_color: mis.color
                            };
                            usersBySlackId[mis.slack_id]['sdh_nick'] = mi.nick;
                            usersBySlackId[mis.slack_id]['sdh_id'] = mi.userid;
                            usersBySlackId[mis.slack_id]['sdh_name'] = mi.name;
                            usersBySlackId[mis.slack_id]['sdh_avatar'] = mi.avatar;
                            usersBySlackId[mis.slack_id]['sdh_email'] = mi.email;
                            usersBySlackId[mis.slack_id]['sdh_position']  = pos;
                            usersBySlackId[mis.slack_id]['sdh_register']  = mi.register;
                        } else {
                            // Only SDH member
                            usersByNick[mi.nick] = {};
                            usersBySDHId[mi.userid] = {};
                        }

                        usersBySDHId[mi.userid]['sdh_nick'] = mi.nick;
                        usersBySDHId[mi.userid]['sdh_id'] = mi.userid;
                        usersBySDHId[mi.userid]['sdh_name'] = mi.name;
                        usersBySDHId[mi.userid]['sdh_avatar'] = mi.avatar;
                        usersBySDHId[mi.userid]['sdh_email'] = mi.email;
                        usersBySDHId[mi.userid]['sdh_position'] = pos;
                        usersBySDHId[mi.userid]['sdh_register'] = mi.register;

                        usersByNick[mi.nick]['sdh_nick'] = mi.nick;
                        usersByNick[mi.nick]['sdh_id'] = mi.userid;
                        usersByNick[mi.nick]['sdh_name'] = mi.name;
                        usersByNick[mi.nick]['sdh_avatar'] = mi.avatar;
                        usersByNick[mi.nick]['sdh_email'] = mi.email;
                        usersByNick[mi.nick]['sdh_position'] = pos;
                        usersByNick[mi.nick]['sdh_register'] = mi.register;

                        if(mix) {
                            // Read Only
                            knownUsers.push(usersByNick[mi.nick]);
                            knownUsersBySlackId[mis.slack_id] = usersByNick[mi.nick];
                            // slack user example format in msg --> '<@u04ekpega>'
                            idRel['<@' + mis.slack_id + '>'] = mi.userid;
                        }
                    }

                    log.debug('-----------------  usersByNick   --------------------');
                    log.debug(JSON.stringify(usersByNick));
                    log.debug('-----------------  usersBySlackId   --------------------');
                    log.debug(JSON.stringify(usersBySlackId));
                    log.debug('-----------------  usersBySDHId   --------------------');
                    log.debug(JSON.stringify(usersBySlackId));
                    log.debug('-----------------  knownUsers   --------------------');
                    log.debug(JSON.stringify(knownUsers));
                    log.debug('-----------------  knownUsersBySlackId   --------------------');
                    log.debug(JSON.stringify(knownUsersBySlackId));
                    //sdhBot.setMembersIdRel(idRel);
                });
            });
        });

    });

};

var launchSlackBot = function launchSlackBot (callback) {
    log.info('...loading slack bot interface ...');
    bot = require("./slackInterface.js");
    bot.setListeners(function() {
        log.info('...slack interface ready...');
        callback();
    });
};

init();
