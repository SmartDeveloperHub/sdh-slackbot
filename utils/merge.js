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

var Promise = require('bluebird');

module.exports = function(core, bot) {

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

        return Promise.all(resultPromises).then(function (userInfos) {

            if (userInfos.length > 0) {
                var slackIdMappings = {};
                var getSdhMembers = Promise.promisify(core.data.getSDHMembers);

                return getSdhMembers().then(function (sdhMembers) {
                    for (var u = 0; u < userInfos.length; u++) {
                        var slackUser = userInfos[u].user;
                        var perfectMatch = false;
                        for (var m = 0; m < sdhMembers.length; m++) {
                            var sdhUser = sdhMembers[m];
                            if (slackUser.name == sdhUser.nick) { //Perfect match, set the sdhid
                                slackIdMappings[slackUser.id] = "sdhid:" + sdhUser.uid;
                                perfectMatch = true;
                                break;
                            }
                        }

                        // Not a perfect match. Try to find some information to put instead of the slack id
                        if (!perfectMatch) {
                            if (slackUser.profile.real_name) {
                                slackIdMappings[slackUser.id] = slackUser.profile.real_name;
                            } else if (slackUser.profile.first_name && slackUser.profile.last_name) {
                                slackIdMappings[slackUser.id] = slackUser.profile.first_name + " " + slackUser.profile.last_name;
                            } else if (slackUser.profile.email) {
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

        }).then(function (userAsocs) {
            for (var slackId in userAsocs) {
                if (userAsocs.hasOwnProperty(slackId)) {
                    text = text.replace(new RegExp("<@" + slackId + ">", 'g'), userAsocs[slackId]);
                }
            }

            return text;
        });
    };

    return {
        replaceSlackIds: replaceSlackIds
    }
};