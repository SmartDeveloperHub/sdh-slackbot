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
        token: SLACK_BOT_TOKEN
    }).startRTM();


    _exports.setListeners = function setListeners() {

        // Register directives in the core
        require("./patterns")(core, bot, log);

        controller.on('direct_message', function(bot, message) {

            replaceSlackIds(message.text).then(function(text) {

                try {
                    core.handleMessage(text, function(err, coreResponse) {
                        if(err) {
                            if(!(err instanceof core.errors.InvalidArgument)) {
                                log.error(err);
                            }
                            genericSlackCallback(bot, message, err.message);
                        } else {
                            genericSlackCallback(bot, message, coreResponse);
                        }
                    });
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

    var replaceSlackIds = function(text) {

        var getUserInfo = Promise.promisify(bot.api.users.info);

        var userRegex = /<@(\S+)>/ig;
        var resultPromises = [];
        var m;
        do {
            m = userRegex.exec(text);
            if (m) {
                resultPromises.push(getUserInfo({user: m[1]}));
            }
        } while (m);

        return Promise.all(resultPromises).then(function(userInfos) {

            if(userInfos.length > 0) {
                var slackIdMappings = {};
                var getSdhMembers = Promise.promisify(core.data.getSDHMembers);

                return getSdhMembers().then(function(sdhMembers) {
                    for(var u = 0; u < userInfos.length; u++) {
                        var slackUser = userInfos[u].user;
                        var perfectMatch = false;
                        for(var m = 0; m < sdhMembers.length; m++) {
                            var sdhUser = sdhMembers[m];
                            if(slackUser.name == sdhUser.nick) { //Perfect match, set the sdhid
                                slackIdMappings[slackUser.id] = "sdhid:" + sdhUser.uid;
                                perfectMatch = true;
                                break;
                            }
                        }

                        // Not a perfect match. Try to find some information to put instead of the slack id
                        if(!perfectMatch) {
                            if(slackUser.profile.real_name) {
                                slackIdMappings[slackUser.id] = slackUser.profile.real_name;
                            } else if(slackUser.profile.first_name && slackUser.profile.last_name) {
                                slackIdMappings[slackUser.id] = slackUser.profile.first_name + " " + slackUser.profile.last_name;
                            } else if(slackUser.profile.email) {
                                slackIdMappings[slackUser.id] = slackUser.profile.email;
                            } else {
                                slackIdMappings[slackUser.id] = slackUser.name;
                            }

                        }

                    }

                    return slackIdMappings;
                })
            } else {
                return {};
            }

        }).then(function(userAsocs) {
            for(var slackId in userAsocs) {
                if(userAsocs.hasOwnProperty(slackId)) {
                    text = text.replace(new RegExp("<@"+slackId+">", 'g'), userAsocs[slackId]);
                }
            }

            return text;
        });

    };


    var genericSlackCallback = function genericSlackCallback(bot, message, coreResponse) {

        bot.reply(message, coreResponse);

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

