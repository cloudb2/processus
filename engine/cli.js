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

module.exports = function() {

  console.log(require('./title'));

  cli.parse({
      log:   ['l', 'Sets the log level [debug|verbose|info|warn|error].', 'string', 'error'],
      file:  ['f', 'Workflow or task filename. A task must also include the workflow ID.', 'file', null],
      id: ['i', 'Workflow ID.', 'string', null]
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

    if (options.file === null && options.id === null) {
      logger.error("✘ Must supply a worklfow or task filename.");
      return -1;
    }

    if (options.file === null && options.id !== null) {
      logger.error("✘ Must supply a task filename.");
      return -1;
    }

    var workflowTaskFile;

    try {
      workflowTaskFile = fs.readFileSync(options.file, "utf8");
    }
    catch(err) {
      logger.error("✘ Failed to open JSON file " + options.file + "\n" + err.message);
      return err;
    }

    var workflowTaskJSON;

    try {
      workflowTaskJSON = JSON.parse(workflowTaskFile);
    }
    catch(err){
        logger.error("✘ Failed to parse JSON file " + options.file + "\n" + err.message);
        return err;
    }

    if (options.file !== '' && options.id === null) {

      processus.execute(workflowTaskJSON, function(err, workflow){
        if(!err) {
          logger.debug("Workflow returned successfully.");
          logger.debug(JSON.stringify(workflow, null, 2));
        }
        else {
          logger.error("✘ " + err.message);
          logger.debug(JSON.stringify(workflow, null, 2));
        }
        return err;
      });
    }

    if(options.id !== null){
      processus.updateTasks(options.id, workflowTaskJSON, function(err, workflow){
        if(!err) {
          logger.debug("Workflow returned successfully.");
          logger.debug(JSON.stringify(workflow, null, 2));
        }
        else {
          logger.error("✘ " + err.message);
          logger.debug(JSON.stringify(workflow, null, 2));
        }
        return err;
      });
    }

  });
};
