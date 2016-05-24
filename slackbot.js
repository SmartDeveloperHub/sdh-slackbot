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

    // Load environment variables, either from .env files (development)
    require('dotenv').load();

    require('./utils/log')(
        process.env.FILE_LOG_PATH,
        process.env.FILE_LOG_LEVEL,
        parseInt(process.env.FILE_LOG_PERIOD),
        parseInt(process.env.FILE_LOG_NFILES)
    ).then(function (_log) {
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

    if (!process.env.SLACK_BOT_TOKEN) {
        log.error('SLACK_BOT_TOKEN not found');
        gracefullyShuttingDown();
        return;
    }

    // Create a new logger
    var corelog = log.child({in: 'core'});

    // Load core
    require('sdh-core-bot')(
        "<@USLACKBOT>",
        process.env.SDH_API_URL,
        process.env.SDH_DASHBOARD_URL,
        process.env.SEARCH_URL,
        process.env.SDH_IMAGES_SERVICE,
        corelog
    ).then(launchSlackBot);

};

var launchSlackBot = function launchSlackBot (core) {
    log.info('Loading slack bot interface');
    slack = require("./slackInterface.js")(core, log);
    slack.setListeners();
    log.info('Slack interface ready');
    log.info('...SlackBot listening!...');
};

init();
