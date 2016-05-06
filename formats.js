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

    var PAGINATION_SIZE = 5;

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
        ],
        repository: [
            {
                title: "Name",
                value: "<name>",
                short: true
            },
            {
                title: "Created on",
                value: "<createdon>",
                short: true
            },
            {
                title: "First commit",
                value: "<firstcommit>",
                short: true
            },
            {
                title: "Last commit",
                value: "<lastcommit>",
                short: true
            }
        ],
        product: [
            {
                title: "Name",
                value: "<name>",
                short: true
            }
        ],
        project: [
            {
                title: "Name",
                value: "<name>",
                short: true
            }
        ],
        organization: [
            {
                title: "Name",
                value: "<title>",
                short: true
            }
        ]
    };

    var options = {
        user: {
            thumb_url: "<avatar>"
        },
        repository: {
            thumb_url: "<avatar>"
        },
        product: {
            thumb_url: "<avatar>"
        },
        project: {
            thumb_url: "<avatar>"
        },
        organization: {
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

    var genericObjectFormatter = function(mappings, options, err, response, cb) {

        if(err) {
            cb(err);
        }

        var formatObject = function(obj) {
            if(typeof obj === 'object') {
                return createAttachment(obj, mappings, options || {});
            } else {
                return null;
            }
        };

        var attachments = [];

        if(response instanceof Array) {

            var paginationSize = PAGINATION_SIZE;

            if(response.length > paginationSize && options != null && options.thumb_url != null) {
                cb(null, "There is a lot of images in the result, it make take some time for Slack to process them. Please be patient. :simple_smile:)");
            } else {
                paginationSize = response.length; // Do not paginate if there is no images of there is not too many
            }

            // Send the attachments paginated
            var r = 0, sent = 0;
            while(r < response.length) {

                for(var inPage = 0; r < response.length && inPage < paginationSize; ++r, ++inPage) {
                    attachments.push(formatObject(response[r]));
                }

                // Send messages witha difference of 1 second from the previous one
                setTimeout(function(attachments) {
                    cb(null, {
                        attachments: attachments
                    });
                }.bind(null, attachments), sent++ * 1000);

                attachments = [];
            }

        } else {
            attachments.push(formatObject(response));
            cb(null, {
                attachments: attachments
            });
        }

    };

    return {
        formatUsers: createFormatFunction(genericObjectFormatter.bind(undefined, mappings.user, options.user)),
        formatRepositories: createFormatFunction(genericObjectFormatter.bind(undefined, mappings.repository, options.repository)),
        formatProducts: createFormatFunction(genericObjectFormatter.bind(undefined, mappings.product, options.product)),
        formatProjects: createFormatFunction(genericObjectFormatter.bind(undefined, mappings.project, options.project)),
        formatOrganizations: createFormatFunction(genericObjectFormatter.bind(undefined, mappings.organization, options.organization)),
        nullFormat: createFormatFunction(nullFormatter)
    }

};

