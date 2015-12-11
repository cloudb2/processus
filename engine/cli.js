/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * cli.js: Command line entry point
 */


var logger = require('./logger');
var cli = require('cli');
var fs = require('fs');
var processus = require('./processus');
var store = require('./persistence/store');

//Just export this function
module.exports = function() {

  //Show title, how doesn't like ASCII art?
  console.log(require('./title'));

  //Parse command line
  cli.parse({
      log:   ['l', 'Sets the log level [debug|verbose|info|warn|error].', 'string', 'error'],
      file:  ['f', 'Workflow or task definition. A task must also include the workflow ID. For YAML use .yml postfix.', 'string', null],
      id: ['i', 'Workflow ID.', 'string', null],
      rewind: ['r', 'time in reverse chronological order. 0 is current, 1 is the previous save point etc.', 'number', 0],
      delete: ['d', 'delete a workflow instance', 'string', null],
      deleteALL: ['', 'delete ALL workflow instances.']
  });

  //Now execute main function
  cli.main(function(args, options) {

    //check and set log level
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

    //ok log set, lets' init the store and do the rest
    store.initStore(function(err){

      if(err){
        logger.error("Failed to initialise store: " + err.message);
        //well that wasn't a good start! goodbye
        process.exit(1);
      }

      //Command line wants to delete all
      if(options.deleteALL === true) {
        store.deleteAll(function(err){
          if(err){
            logger.error(err);
            process.exit(1);
          }
          else {
            process.exit(0);
          }
        });
        return;
      }

      //Command line wants to delete a specific instance
      if(options.delete !== null) {
        logger.info("deleting " + options.delete);
        store.deleteInstance(options.delete, function(err){
          if(err){
            logger.error(err);
            process.exit(1);
          }
          else {
            process.exit(0);
          }
        });
        return;
      }

      //We got this far, did we get a file or an id?
      if (options.file === null && options.id === null) {
        logger.error("✘ Must supply a worklfow or task filename.");
        process.exit(1);
      }

      //Command line wants to get an existing instance
      if (options.file === null && options.id !== null) {
        //just an id supplied, so fetch that workflow
        store.loadInstance(options.id, options.rewind, function(err, workflowFile){
          if(!err){
            //force logger to info
            logger.level = 'info';
            if(workflowFile !== undefined){
              logger.info(JSON.stringify(workflowFile, null, 2));
              process.exit(0);
              return;
            }
            else {
              logger.error("Unable to find workflow instance [" + options.id + "]");
              process.exit(1);
              return;
            }
          }
          else {
            logger.error(err.message);
            process.exit(1);
            return;
          }
        });
        return;
      }

      //Ok, got this far, so we must have a file name to load
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
        logger.error("Workflow definition [" + options.file + "] not found.");
        process.exit(1);
        return;
      }

      //Right, well, we have the workflow and all looks good, let's execute it
      //fingers crossed!
      processus.runWorkflow(options.file, options.id, workflowTaskJSON, function(err, workflow){
        if(err){
          logger.error(err.message);
          process.exit(1);
        }
        else {
          process.exit(0);
        }
      });
    });
  });
};
