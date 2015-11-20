/*!
 * Processus, by Cloudb2.
 *
 * This file (and this file only) is licensed under the same slightly modified
 * MIT license that Processus is. It stops evil-doers everywhere:
 *
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom
 *   the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software.
 *
 *   The Software shall be used for Good, not Evil.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 */
var cli = require('cli');
var fs = require('fs');
var processus = require('./processus');
var logger = require('./logger');
var store = require('./persistence/store');

module.exports = function() {

  console.log(require('./title'));

  cli.parse({
      log:   ['l', 'Sets the log level [debug|verbose|info|warn|error].', 'string', 'error'],
      file:  ['f', 'Workflow or task definition. A task must also include the workflow ID.', 'string', null],
      id: ['i', 'Workflow ID.', 'string', null],
      rewind: ['r', 'time in reverse chronological order. 0 is current, 1 is the previous save point etc.', 'number', 0],
      delete: ['d', 'delete a workflow instance', 'string', null],
      deleteALL: ['', 'delete ALL workflow instances.']

  });

  cli.main(function(args, options) {

    if (options.log === 'debug' ||
        options.log === 'verbose' ||
        options.log === 'info' ||
        options.log === 'warn' ||
        options.log === 'error') {

        logger.level = options.log;
    }
    else {
      logger.error("✘ Invalid log level, see help for more info.");
      return -1;
    }

    if(options.deleteALL === true) {
      store.deleteAll(function(err){
        if(err){
          logger.error(err);
        }
      });
      return;
    }

    if(options.delete !== null) {

      store.deleteInstance(options.delete, function(err){
        if(err){
          logger.error(err);
        }
      });
      return;

    }

    if (options.file === null && options.id === null) {
      logger.error("✘ Must supply a worklfow or task filename.");
      return -1;
    }


    if (options.file === null && options.id !== null) {
      //just an id supplied, so fetch that workflow
      store.loadInstance(options.id, options.rewind, function(err, workflowFile){
        if(!err){
          //force logger to info
          logger.level = 'info';
          logger.info(JSON.stringify(workflowFile, null, 2));
          return;
        }
        else {
          logger.error(err.message);
          return err;

        }
      });
      return;
    }

    var workflowTaskJSON;
    store.loadDefinition(options.file, function(err, workflowFile){
      if(!err){
        workflowTaskJSON = workflowFile;
      }
      else {
        logger.error(err.message);
        return err;

      }
    });
    if(workflowTaskJSON === undefined){
      return;
    }

    processus.runWorkflow(options.file, options.id, workflowTaskJSON, function(err, workflow){
      if(err){
        //logger.error(err);
      }
    });

  });
};
