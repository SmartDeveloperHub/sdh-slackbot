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

module.exports = function(bot, log) {

    var PAGINATION_SIZE = 5;

    var mappings = [ //Order is important!
        {
            selectionConditions: {
                containsProperty: ['uid']
            },
            attachmentFields: [
                {
                    title: "Nick",
                    value: "<nick>",
                    short: true
                }
            ],
            attachmentOptions: {
                thumb_url: "<avatar>",
                author_name: "<name>",
                author_link: function(user) {
                    var userEnv = {
                        uid: user.uid,
                        name: user.name
                    };
                    return generateDashboardLink(userEnv, 'developer');
                }
            }

        },

        {
            selectionConditions: {
                containsProperty: ['rid']
            },
            attachmentFields: [
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
            attachmentOptions: {
                thumb_url: "<avatar>",
                author_name: "<name>",
                author_link: function(repository) {
                    var userEnv = {
                        rid: repository.rid,
                        name: repository.name
                    };
                    return generateDashboardLink(userEnv, 'repository');
                }
            }

        },

        {
            selectionConditions: {
                containsProperty: ['prid']
            },
            attachmentFields: [],
            attachmentOptions: {
                thumb_url: "<avatar>",
                author_name: "<name>",
                author_link: function(product) {
                    var userEnv = {
                        prid: product.prid,
                        name: product.name
                    };
                    return generateDashboardLink(userEnv, 'product');
                }
            }

        },

        {
            selectionConditions: {
                containsProperty: ['pjid']
            },
            attachmentFields: [],
            attachmentOptions: {
                thumb_url: "<avatar>",
                author_name: "<name>",
                author_link: function(projects) {
                    var userEnv = {
                        pjid: projects.pjid,
                        name: projects.name
                    };
                    return generateDashboardLink(userEnv, 'project');
                }
            }

        },

        {
            selectionConditions: {
                containsProperty: ['oid']
            },
            attachmentFields: [
                {
                    title: "Name",
                    value: "<name>",
                    short: true
                }
            ],
            attachmentOptions: {
                thumb_url: "<avatar>"
            }

        },

        { //Metric info
            selectionConditions: {
                containsProperty: ['aggr']
            },
            attachmentFields: [
                {
                    title: "Id",
                    value: "<id>",
                    short: true
                },
                {
                    title: "Description",
                    value: "<description>",
                    short: true
                }
            ],
            attachmentOptions: {}

        },

        { //View info
            selectionConditions: {
                containsProperty: ['id']
            },
            attachmentFields: [
                {
                    title: "Id",
                    value: "<id>",
                    short: true
                }
            ],
            attachmentOptions: {}

        }
    ];

    var generateDashboardLink = function(env, dashboard) {
        return SDH_DASHBOARD_URL + "?env=" + encodeURIComponent(JSON.stringify(env)) + "&dashboard=" + dashboard
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

    var parseValue = function(format, object) {
        if(typeof format === 'string' && format[0] === '<' && format[format.length - 1] === '>') {
            return object[format.substring(1, format.length - 1)];
        } else if(typeof format === 'function') {
            return format(object);
        } else {
            return format;
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

    var detectObjectType = function(obj) {

        for(var m = 0; m < mappings.length; ++m) {
            var objInfo = mappings[m];

            if(objInfo.selectionConditions.containsProperty) {
                for(var p = 0; p < objInfo.selectionConditions.containsProperty.length; ++p) {
                    if(objInfo.selectionConditions.containsProperty[p] in obj) {
                        return objInfo;
                    }
                }
            }
        }

    };

    var formatObject = function(obj, typeInfo) {
        if(typeof obj === 'object') {

            if(typeInfo) {
                return createAttachment(obj, typeInfo.attachmentFields, typeInfo.attachmentOptions || {});
            } else {
                return null;
            }

        } else {
            return null;
        }
    };

    var nullFormatter = function(err, response, cb) {
        cb(err,(typeof response === 'object' ? JSON.stringify(response) : response));
    };

    var genericObjectFormatter = function(err, response, cb) {

        if(err) {
            cb(err);
        }

        var attachments = [];
        var typeInfo;
        var formatted;

        if(response instanceof Array) {

            if(response.length) {

                var paginationSize = PAGINATION_SIZE;

                //Detect the type of the objects (take the first element as a representative object)
                typeInfo = detectObjectType(response[0]);

                if(typeInfo && response.length > paginationSize && typeInfo.attachmentOptions != null && typeInfo.attachmentOptions.thumb_url != null) {
                    cb(null, "There are a lot of images in the result, it may take some time for Slack to process them. Please be patient. :simple_smile:");
                } else {
                    paginationSize = response.length; // Do not paginate if there is no images of there is not too many
                }

                // Send the attachments paginated
                var r = 0, sent = 0;
                while(r < response.length) {

                    for(var inPage = 0; r < response.length && inPage < paginationSize; ++r, ++inPage) {
                        formatted = formatObject(response[r], typeInfo);
                        if(formatted) {
                            attachments.push(formatted);
                        } else {
                            log.warn("Unknown object type")
                        }
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
                cb(null, "There is no information to display...");
            }

        } else {

            //Detect the type of the object and get the mapping info
            typeInfo = detectObjectType(response);

            formatted = formatObject(response, typeInfo);
            if(formatted) {
                attachments.push(formatted);
                cb(null, {
                    attachments: attachments
                });
            } else {
                log.warn("Unknown object type")
            }

        }

    };

    var metricFormatter = function(err, response, cb) {

        if(err) {
            cb(err);
        }

        if(typeof response === 'object' && response.values != null) {
            cb(null, response.values.join(", "));
        } else {
            cb(null, response);
        }

    };

    var viewFormatter = function(err, response, cb) {

        if(err) {
            cb(err);
        }

        genericObjectFormatter(err, response.values, cb);

    };

    return {
        formatUsers: createFormatFunction(genericObjectFormatter),
        formatRepositories: createFormatFunction(genericObjectFormatter),
        formatProducts: createFormatFunction(genericObjectFormatter),
        formatProjects: createFormatFunction(genericObjectFormatter),
        formatOrganizations: createFormatFunction(genericObjectFormatter),
        formatMetricsInfo: createFormatFunction(genericObjectFormatter),
        formatMetricData: createFormatFunction(metricFormatter),
        formatViewsInfo: createFormatFunction(genericObjectFormatter),
        formatViewsData: createFormatFunction(viewFormatter),
        nullFormat: createFormatFunction(nullFormatter)
    }

};

