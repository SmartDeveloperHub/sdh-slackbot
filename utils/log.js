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
var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');
var getDirName = require("path").dirname;
var mkdirp = Promise.promisify(require("mkdirp"));

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(path, level, period, nfiles) {

    var prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);

    return mkdirp(getDirName(path)).then(function() {

        return bunyan.createLogger({
            name: 'SDH-BOT',
            streams: [{
                level: level,
                stream: prettyStdOut
            },
                {
                    level: level,
                    type: 'rotating-file',
                    path: path,
                    period: period + 'h',
                    count: nfiles
                }]
        });

    });


};

