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

    var corePatterns = {
        '/help/':{
            'callback': core.ops.helpme,
            'description': "Return core bot help information"
        },
        '/give me all metrics/':{
            'callback': core.ops.allMetrics,
            'description': "Return complete SDH metrics list"
        },
        '/give me metrics about [\\s\\S]+/':{
            'callback': core.ops.allMetrics,
            'description': "Return complete SDH metrics list"
        },
        '/give me [\\s\\S]+ metrics/':{
            'callback': core.ops.getMetricsAbout,
            'description': "Return complete SDH metrics list"
        },
        '/give me all views/':{
            'callback': core.ops.allViews,
            'description': "Return complete SDH views list"
        },
        '/give me all organizations/':{
            'callback': core.ops.allOrgs,
            'description': "Return complete SDH organizations list"
        },
        '/give me all products/':{
            'callback': core.ops.allProducts,
            'description': "Return complete SDH projects list"
        },
        '/give me all projects/':{
            'callback': core.ops.allProjects,
            'description': "Return complete SDH projects list"
        },
        '/give me all users|give me all members/':{
            'callback': core.ops.allMembers,
            'description': "Return complete SDH products list"
        },
        '/give me all repositories/':{
            'callback': core.ops.allRepos,
            'description': "Return complete SDH products list"
        },
        /*'/give me [\\s\\S]+ information/':{
         'callback': allRepos,
         'description': "Return complete SDH products list"
         },*/
        '/give me [\\s\\S]+ product':{
            'callback': core.ops.product,
            'description': "Return a SDH product"
        },
        '/give me [\\s\\S]+ project/':{
            'callback': core.ops.project,
            'description': "Return a SDH project"
        },
        '/give me [\\s\\S]+ user|give me [\\s\\S]+ member/':{
            'callback': core.ops.member,
            'description': "Return a SDH member"
        },
        '/give me [\\s\\S]+ repository|give me [\\s\\S]+ repo/':{
            'callback': core.ops.repo,
            'description': "Return a SDH repository"
        },
        '/give me [\\s\\S]+ metric/':{
            'callback': core.ops.metric,
            'description': "Return SDH metric data"
        },
        '/give me [\\s\\S]+ view/':{
            'callback': core.ops.view,
            'description': "Return SDH view data"
        },
        //'/[a-zA-Z]+/':{
        /*'/[\\s\\S]/':{
         'callback': sdhParser,
         'description': "Return elastic matching info"
         }*/
    };

    return corePatterns;


};

