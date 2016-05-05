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
'use strict';

module.exports = function(bot) {

    // Visualization functions
    var mappings = {
        user: [
            {
                title: "Name",
                value: "<name>",
                short: true
            },
            {
                title: "Nick",
                value: "<nick>",
                short: true
            }
        ]
    };

    var options = {
        user: {
            thumb_url: "<avatar>"
        }
    };

    var createFormatFunction = function(formatter) {

        return function(operation) {

            return function() {
                var cb = arguments[0];
                arguments[0] = function(err, response) {
                    formatter(err, response, cb);
                };

                operation.apply(null, arguments);
            }

        }

    };

    var parseValue = function(txt, object) {
        if(txt[0] === '<' && txt[txt.length - 1] === '>') {
            return object[txt.substring(1, txt.length - 1)];
        } else {
            return txt;
        }
    };

    var createAttachment = function createAttachment(object, mapping, options) {
        var attach = {};

        for(var opt in options) {
            if(options.hasOwnProperty(opt)) {
                attach[opt] = parseValue(options[opt], object);
            }
        }

        var fields = [];

        for(var i = 0; i < mapping.length; ++i) {
            var map = mapping[i];
            fields.push({
                title: map.title,
                value: parseValue(map.value, object),
                short: map.short
            });
        }

        attach['fields'] = fields;

        return attach;

    };

    var nullFormatter = function(err, response) {
        cb(err,(typeof response === 'object' ? JSON.stringify(response) : response));
    };

    var usersFormatter = function(err, response, cb) {

        if(err) {
            cb(err);
        }

        var formatUser = function(user) {
            if(typeof user === 'object') {
                return createAttachment(user, mappings.user, options.user || {});
            } else {
                return null; //Not an user
            }
        };

        var attachments = [];

        if(response instanceof Array) {
            for(var r = 0; r < response.length; ++r) {
                attachments.push(formatUser(response[r]));
            }
        } else {
            attachments.push(formatUser(response));
        }

        cb(null, {
            attachments: attachments
        });

    };

    return {
        formatUsers: createFormatFunction(usersFormatter),
        nullFormat: createFormatFunction(nullFormatter)
    }

};

