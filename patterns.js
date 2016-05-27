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

module.exports = function(core, bot, log) {

    var f = require("./formats")(bot, log);
    var SlackSdhMerge = require('./utils/merge')(core, bot);

    var substituteWithCurrentUser = function(regexp, value, extraInfo) {
        if(regexp.test(value)) {
            var currentUserSlackId = extraInfo.user;
            return SlackSdhMerge.replaceSlackIds("<@"+currentUserSlackId+">");
        } else {
            return value;
        }
    };

    var help = function(callback) {
        callback (null, {
            'title': "Help Information",
            'description': "This is the slack bot basic methods help information",
            'attachments': [
                {
                    title: "give me all metrics",
                    text: "Retrieve a list with all the metrics in SDH"
                },
                {
                    title: "give me metrics about <text>",
                    text: "Retrieve a list of metrics related with the text"
                },
                {
                    title: "give me <text> metrics",
                    text: "Retrieve a list of metrics related with the text"
                },
                {
                    title: "give me [an image with] [<n_values> value[s]] [[with ]the {avg|max|sum} ][of ]metric <metric_id> [for <metric_param>] [from <from_date>] [until <to_date>]",
                    text: "Obtain a metric. This metric can be visualized as an image. A range of dates can be specified as well as the number of values to obtain."
                },
                {
                    title: "give me all views",
                    text: "Retrieve a list with all the views in SDH."
                },
                {
                    title: "give me views about <text>",
                    text: "Retrieve a list of views related with the text."
                },
                {
                    title: "give me <text> views",
                    text: "Retrieve a list of views related with the text."
                },
                {
                    title: "give me view <view_id> [for <metric_param>] [from <from_date>] [until <to_date>]",
                    text: "Obtain a view. A range of dates can be specified."
                },
                {
                    title: "give me all organizations",
                    text: "Retrieve a list of the organizations."
                },
                {
                    title: "give me all products",
                    text: "Retrieve a list of the products."
                },
                {
                    title: "give me all projects",
                    text: "Retrieve a list of the projects."
                },
                {
                    title: "give me all {users|members}",
                    text: "Retrieve a list of the members."
                },
                {
                    title: "give me all repos[itories]",
                    text: "Retrieve a list of the repositories."
                },
                {
                    title: "give me <text> product",
                    text: "Retrieve information about an specific product. <text> does not need to be a product id, it can be a text that will be used to search with and the information of the best matching will be displayed."
                },
                {
                    title: "give me <text> project",
                    text: "Retrieve information about an specific proejct. <text> does not need to be a project id, it can be a text that will be used to search with and the information of the best matching will be displayed."
                },
                {
                    title: "give me <text> {user|member}",
                    text: "Retrieve information about an specific member. <text> does not need to be a product id, it can be a text that will be used to search with and the information of the best matching will be displayed."
                },
                {
                    title: "give me <text> repo[sitory]",
                    text: "Retrieve information about an specific repository. <text> does not need to be a repository id, it can be a text that will be used to search with and the information of the best matching will be displayed."
                }
            ]
        });
    };

    // Return core bot help information
    core.registerDirective(/help/i, help);

    // Return complete SDH metrics list
    core.registerDirective(/give me all metrics/i, f.formatMetricsInfo(core.ops.allMetrics));

    // Return SDH metric
    core.registerDirective(/give me metrics about ([\s\S]+)/i, f.formatMetricsInfo(core.ops.getMetricsAbout), [new core.RgxSubstr(0)]);
    core.registerDirective(/give me ([\s\S]+) metrics/i, f.formatMetricsInfo(core.ops.getMetricsAbout), [new core.RgxSubstr(0)]);

    // Return a SDH metric data (match things like "give me an image with 5 values with the avg of metric product-commits for Alejandro Vera from last month until last Friday")
    core.registerDirective(/give me(?: an (image) with)? (?:(\d+)\svalue(?:s)? )?(?:(?:with )?the (avg|max|sum) )?(?:of )?metric (\S+(?:\s\S+)*?)(?: for (\S+(?:\s\S+)*?))?(?: from (\S+(?:\s\S+)*?))?(?: until (\S+(?:\s\S+)*?))?$/i,
        f.formatMetricData(core.ops.metric),
        [
            new core.RgxSubstr(3),
            {
                max: new core.RgxSubstr(1),
                aggr: new core.RgxSubstr(2),
                param: new core.RgxSubstr(4, substituteWithCurrentUser.bind(undefined, /^me$/)),
                from: new core.RgxSubstr(5),
                to: new core.RgxSubstr(6),
                format: new core.RgxSubstr(0)
            }
        ]
    );

    // Return complete SDH views list
    core.registerDirective(/give me all views/i, f.formatViewsInfo(core.ops.allViews));

    // Return a SDH view data
    core.registerDirective(/give me views about ([\s\S]+)/i, f.formatViewsInfo(core.ops.getViewsAbout), [new core.RgxSubstr(0)]);
    core.registerDirective(/give me ([\s\S]+) views/i, f.formatViewsInfo(core.ops.getViewsAbout), [new core.RgxSubstr(0)]);

    // Return a SDH view (match things like "give me view view-member-repositories for Alejandro Vera")
    core.registerDirective(/give me view (\S+(?:\s\S+)*?)(?: for (\S+(?:\s\S+)*?))?(?: from (\S+(?:\s\S+)*?))?(?: until (\S+(?:\s\S+)*?))?$/i,
        f.formatViewsData(core.ops.view),
        [
            new core.RgxSubstr(0),
            {
                param: new core.RgxSubstr(1, substituteWithCurrentUser.bind(undefined, /^me$/)),
                from: new core.RgxSubstr(2),
                to: new core.RgxSubstr(3)
            }
        ]
    );

    // Return complete SDH organizations list
    core.registerDirective(/give me all organizations/i, f.formatOrganizations(core.ops.allOrgs));

    // Return complete SDH products list
    core.registerDirective(/give me all products/i, f.formatProducts(core.ops.allProducts));

    // Return complete SDH projects list
    core.registerDirective(/give me all projects/i, f.formatProjects(core.ops.allProjects));

    // Return complete SDH members list
    core.registerDirective(/give me all (?:users|members)/i, f.formatUsers(core.ops.allMembers));

    // Return complete SDH repositories list
    core.registerDirective(/give me all repos(?:itories)?/i, f.formatRepositories(core.ops.allRepos));

    // Return a SDH product
    core.registerDirective(/give me ([\s\S]+) product/i, f.formatProducts(core.ops.product), [new core.RgxSubstr(0)]);

    // Return a SDH project
    core.registerDirective(/give me ([\s\S]+) project/i, f.formatProjects(core.ops.project), [new core.RgxSubstr(0)]);

    // Return a SDH member
    core.registerDirective(/give me ([\s\S]+) (?:user|member)/i,
        f.formatUsers(core.ops.member),
        [new core.RgxSubstr(0, substituteWithCurrentUser.bind(undefined, /^my$/))]);

    // Return a SDH repository
    core.registerDirective(/give me ([\s\S]+) repo(?:sitory)?/i, f.formatRepositories(core.ops.repo), [new core.RgxSubstr(0)]);

    // Fallback
    core.registerDirective(/.*/, function(cb) {
        var msgs = [
            "I'm sorry. I couldn't understand you. :sweat_smile:",
            "Sorry...What did you say? :thinking_face:",
            "I can't understand that message. :confused:",
            "I'm confused...What did you say? :confused:"
        ];
        cb(null, msgs[Math.round(Math.random() * (msgs.length - 1))]);
    });

    return {};


};

