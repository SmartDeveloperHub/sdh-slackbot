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
            launchSlackBot(sdhBot, function() {
                log.info('... slackbot Listenen! ...');
                bot.getSlackMembers(function(slackMembers) {


                });
            });
        });

    });

};

var launchSlackBot = function launchSlackBot (core, callback) {
    log.info('...loading slack bot interface ...');
    bot = require("./slackInterface.js")(core, log);
    bot.setListeners(function() {
        log.info('...slack interface ready...');
        if(typeof callback === 'function') callback();
    });
};

init();
