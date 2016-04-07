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

var log = null;
var slack = null;

var init = function() {

    try {
        // Set Config params
        require('./config');
    } catch (err) {
        console.error("Fatal BOT Error with config: " + err);
        setTimeout(function() {
            process.exit(0);
        }, 1000);
    }

    require('./utils/log')(FILE_LOG_PATH, FILE_LOG_LEVEL, FILE_LOG_PERIOD, FILE_LOG_NFILES).then(function (_log) {
        log = _log;
        startBOT();
    });
};


var startBOT = function startBOT () {

    log.info('...Starting SlackBot...');

    // Shut down function
    var gracefullyShuttingDown = function gracefullyShuttingDown() {
        log.warn('Shut down signal Received ');
        log.warn(" ! Shutting Down SDH-API manually.");
        setTimeout(function () {
            process.exit(0);
        }, 500);
    };
    // Set security handlers
    process.on('SIGINT', gracefullyShuttingDown);
    process.on('SIGTERM', gracefullyShuttingDown);

    process.on('uncaughtException', function (err) {
        log.error(err);
        log.warn("Something is wrong, but SDH will continue on line");
    });

    if (!SLACK_BOT_TOKEN) {
        log.error('SLACK_BOT_TOKEN not found');
        gracefullyShuttingDown();
        return;
    }

    // Create a new logger
    var corelog = log.child({in: 'core'});

    // Load core
    require('sdh-core-bot')("<@USLACKBOT>", SDH_API_URL, SDH_DASHBOARD_URL, corelog).then(launchSlackBot);

};

var launchSlackBot = function launchSlackBot (core) {
    log.info('Loading slack bot interface');
    slack = require("./slackInterface.js")(core, log);
    slack.setListeners();
    log.info('Slack interface ready');
    log.info('...SlackBot listening!...');
};

init();
