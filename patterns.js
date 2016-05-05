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

module.exports = function(core, bot) {

    var f = require("./formats")(bot);

    // Return core bot help information
    core.registerDirective(/help/i, core.ops.helpme);

    // Return complete SDH metrics list
    core.registerDirective(/give me all metrics/i, f.nullFormat(core.ops.allMetrics));

    // Return SDH metric
    core.registerDirective(/give me metrics about ([\s\S]+)/i, f.nullFormat(core.ops.getMetricsAbout), [new core.RgxSubstr(0)]);
    core.registerDirective(/give me ([\s\S]+) metrics/i, f.nullFormat(core.ops.getMetricsAbout), [new core.RgxSubstr(0)]);

    // Return a SDH metric data (match things like "give me 5 values with the avg of metric product-commits for Alejandro Vera from last month until last Friday as image")
    core.registerDirective(/give me (?:(\d+)\svalues )?(?:(?:with )?the (avg|max|sum) )?(?:of )?metric (\S+(?:\s\S+)*?)(?: for (\S+(?:\s\S+)*?))?(?: from (\S+(?:\s\S+)*?))?(?: until (\S+(?:\s\S+)*?))?(?: as (image))?$/i,
        f.nullFormat(core.ops.metric),
        [
            new core.RgxSubstr(2),
            {
                max: new core.RgxSubstr(0),
                aggr: new core.RgxSubstr(1),
                param: new core.RgxSubstr(3),
                from: new core.RgxSubstr(4),
                to: new core.RgxSubstr(5),
                format: new core.RgxSubstr(6)
            }
        ]
    );

    // Return a SDH view (match things like "give me 5 values of view view-member-repositories for Alejandro Vera")
    core.registerDirective(/give me view (\S+(?:\s\S+)*?)(?: for (\S+(?:\s\S+)*?))?(?: from (\S+(?:\s\S+)*?))?(?: until (\S+(?:\s\S+)*?))?$/i,
        f.nullFormat(core.ops.view),
        [
            new core.RgxSubstr(0),
            {
                param: new core.RgxSubstr(1),
                from: new core.RgxSubstr(2),
                to: new core.RgxSubstr(3)
            }
        ]
    );

    // Return a SDH view data
    core.registerDirective(/give me ([\s\S]+) view/i, f.nullFormat(core.ops.view), [new core.RgxSubstr(0)]);

    // Return complete SDH views list
    core.registerDirective(/give me all views/i, f.nullFormat(core.ops.allViews));

    // Return complete SDH organizations list
    core.registerDirective(/give me all organizations/i, f.nullFormat(core.ops.allOrgs));

    // Return complete SDH products list
    core.registerDirective(/give me all products/i, f.nullFormat(core.ops.allProducts));

    // Return complete SDH projects list
    core.registerDirective(/give me all projects/i, f.nullFormat(core.ops.allProjects));

    // Return complete SDH members list
    core.registerDirective(/give me all (?:users|members)/i, f.formatUsers(core.ops.allMembers));

    // Return complete SDH repositories list
    core.registerDirective(/give me all repos(?:itories)?/i, f.nullFormat(core.ops.allRepos));

    // Return a SDH product
    core.registerDirective(/give me ([\s\S]+) product/i, f.nullFormat(core.ops.product), [new core.RgxSubstr(0)]);

    // Return a SDH project
    core.registerDirective(/give me ([\s\S]+) project/i, f.nullFormat(core.ops.project), [new core.RgxSubstr(0)]);

    // Return a SDH member
    core.registerDirective(/give me ([\s\S]+) (?:user|member)/i, f.formatUsers(core.ops.member), [new core.RgxSubstr(0)]);

    // Return a SDH repository
    core.registerDirective(/give me ([\s\S]+) repo(?:sitory)?/i, f.nullFormat(core.ops.repo), [new core.RgxSubstr(0)]);


    //var corePatterns = {
    //    '/help/':{
    //        'callback': core.ops.helpme,
    //        'description': "Return core bot help information"
    //    },
    //    /*'/give me [\\s\\S]+ information/':{
    //     'callback': allRepos,
    //     'description': "Return complete SDH products list"
    //     },*/
    //    //'/[a-zA-Z]+/':{
    //    /*'/[\\s\\S]/':{
    //     'callback': sdhParser,
    //     'description': "Return elastic matching info"
    //     }*/
    //};
    //
    //return corePatterns;

    return {};


};

