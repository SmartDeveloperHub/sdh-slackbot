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

module.exports = function(core, log) {


    var _exports = {};

    // Bootkit or Slack Bots
    var Botkit = require('botkit');
    var os = require('os');
    var patterns = require("./patterns")(sdhBot);

    GLOBAL.controller = Botkit.slackbot({
        debug: false
    });

    var bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    }).startRTM();



    //var a = sdhBot.getSDHMembers(function(data) {slog.info(data)});


    _exports.setListeners = function setListeners(callback){
        /*for (var pattern in patterns) {
         generateSlackListener (pattern, 'direct_message', patterns[pattern]);
         }*/
        generateSlackListener ('/.*/', 'direct_message');
        callback();
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

    controller.hears(['demo'], 'direct_message', function(bot, message) {
        log.info("DEMO");
        bot.reply(message, "All people love demos " + message.user + "...");
    });

    var generateSlackListener = function generateSlackListener (pattern, type, patternInfo) {
        pattern = pattern.substring(1, pattern.length-1);
        var newP = pattern.split("|");
        controller.hears(newP, type, function(bot, message) {
            //TODO refact message
            try {
                sdhBot.handleMessage(message.text, function(coreResponse) {
                    // TODO
                    genericSlackCalback(bot, message, pattern, coreResponse);
                });
                /*patternInfo.callback(message.user, message, function(coreResponse) {
                 // TODO
                 genericSlackCalback(bot, message, pattern, coreResponse);
                 });*/
            } catch(e) {
                log.error(e);
            }

        });
    };

    var genericSlackCalback = function genericSlackCalback(bot, message, pattern, coreResponse) {
        bot.reply(message,JSON.stringify(coreResponse));
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

