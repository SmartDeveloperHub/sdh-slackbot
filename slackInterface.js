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
var Botkit = require('botkit');
var Promise = require('bluebird');

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(core, log) {

    var _exports = {};

    GLOBAL.controller = Botkit.slackbot({
        debug: false
    });

    var bot = controller.spawn({
        token: process.env.SLACK_BOT_TOKEN
    }).startRTM();

    var SlackSdhMerge = require('./utils/merge')(core, bot);


    _exports.setListeners = function setListeners() {

        // Register directives in the core
        require("./patterns")(core, bot, log);

        controller.on('direct_message', function(bot, message) {

            SlackSdhMerge.replaceSlackIds(message.text).then(function(text) {

                try {
                    bot.startTyping(message);
                    core.handleMessage(text, function(err, coreResponse) {
                        if(err) {
                            if(!(err instanceof core.errors.InvalidArgument)) {
                                log.error(err);
                            }
                            genericSlackCallback(bot, message, err.message);
                        } else {
                            genericSlackCallback(bot, message, coreResponse);
                        }
                    }, {user: message.user});
                } catch(e) {
                    log.error(e);
                }

            });

        });

    };

    _exports.getSlackMembers = function getSlackMembers(callback) {
        bot.api.users.list({}, function(err, res) {
            if (err) {
                log.error(err);
                return;
            }
            callback(res.members);
        })
    };


    var genericSlackCallback = function genericSlackCallback(bot, message, coreResponse) {

        if(typeof coreResponse === 'object' && coreResponse.finished != null) {
            bot.reply(message, coreResponse.returned);
            if(!coreResponse.finished) {
                bot.startTyping(message);
            }
        } else {
            bot.reply(message, coreResponse);
        }


    };

    /*// reply to @bot hello
     controller.on('',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     bot.reply(message,'I heard you mention me!');

     });

     controller.on('ambient',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     bot.reply(message,'Ok. ambient!');

     });

     controller.on('message_received',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     bot.reply(message,'Ok. message_received!');

     });
     controller.on('user_group_join',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     log.warn("New user: ");
     log.debug(message);
     bot.reply(message,'Ok. user_group_join!');

     });
     controller.on('user_channel_join',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     log.warn("New user: ");
     log.debug(message);
     bot.reply(message,'Ok. user_channel_join!');

     });
     // reply to a direct message
     controller.on('direct_message',function(bot,message) {

     // reply to _message_ by using the _bot_ object
     //bot.reply(message,'You are talking directly to me');

     });

     bot.api.users.getPresence({},function(err,response) {
     log.info('....api.users.getPresence...');
     //log.info(response);
     });

     bot.api.users.info({},function(err,response) {
     log.info('....api.users.info...');
     //log.info(response);
     });

     bot.api.users.list({},function(err,response) {
     log.info('....api.users.list...');
     //log.info(response);
     });

     bot.api.users.setActive({},function(err,response) {
     log.info('....api.users.setActive...');
     //log.info(response);
     });

     bot.api.users.setPresence({},function(err,response) {
     log.info('....api.users.setPresence...');
     //log.info(response);
     });

     bot.api.channels.list({},function(err,response) {
     log.info('...channels.list...');
     //log.info(response); //All channels list
     });

     bot.api.channels.info({},function(err,response) {
     log.info('...api.channels.info...');
     //log.info(response); //All channel info
     });

     bot.api.channels.join({},function(err,response) {
     log.info('...api.channels.join...');
     //log.info(response); //Channel join
     });

     bot.api.channels.leave({},function(err,response) {
     log.info('...api.channels.leave...');
     //log.info(response); //Channel leave
     });*/

    return _exports;

};

