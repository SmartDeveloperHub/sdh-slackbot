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

module.exports = function(core) {

    //TODO: create a method to call the method for each pattern given the pattern and the variables in the pattern,
    // not all the text as it is now

    // Return core bot help information
    core.registerDirective(/help/i, core.ops.helpme);

    // Return complete SDH metrics list
    core.registerDirective(/give me all metrics/i, core.ops.allMetrics);

    // Return SDH metric
    core.registerDirective(/give me metrics about ([\s\S]+)/i, core.ops.getMetricsAbout, [0]);
    core.registerDirective(/give me ([\s\S]+) metrics/i, core.ops.getMetricsAbout, [0]);

    // Return complete SDH views list
    core.registerDirective(/give me all views/i, core.ops.allViews);

    // Return complete SDH organizations list
    core.registerDirective(/give me all organizations/i, core.ops.allOrgs);

    // Return complete SDH products list
    core.registerDirective(/give me all products/i, core.ops.allProducts);

    // Return complete SDH projects list
    core.registerDirective(/give me all projects/i, core.ops.allProjects);

    // Return complete SDH members list
    core.registerDirective(/give me all (?:users|members)/i, core.ops.allMembers);

    // Return complete SDH repositories list
    core.registerDirective(/give me all repos(?:itories)?/i, core.ops.allRepos);

    // Return a SDH product
    core.registerDirective(/give me ([\s\S]+) product/i, core.ops.product, [0]);

    // Return a SDH project
    core.registerDirective(/give me ([\s\S]+) project/i, core.ops.project, [0]);

    // Return a SDH member
    core.registerDirective(/give me ([\s\S]+) (?:user|member)/i, core.ops.member, [0]);

    // Return a SDH repository
    core.registerDirective(/give me ([\s\S]+) repo(?:sitory)?/i, core.ops.repo, [0]);

    // Return a SDH metric data
    core.registerDirective(/give me ([\s\S]+) metric/i, core.ops.metric, [0]);

    // Return a SDH view data
    core.registerDirective(/give me ([\s\S]+) view/i, core.ops.view, [0]);


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

