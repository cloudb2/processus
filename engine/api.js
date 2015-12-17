/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * api.js: Proessus API as used by other node apps
 */

//declare required modules
var logger = require('./logger');
var store = require('./persistence/store');
var p = require('./processus');

//set default log level
logger.level = 'info';

module.exports = {
  execute: execute,
  updateWorkflow: updateWorkflow,
  setLogLevel: setLogLevel,
  getWorkflow: getWorkflow,
  deleteWorkflow: deleteWorkflow,
  deleteAll: deleteAll,
  getWorkflows: getWorkflows,
  saveDefinition: saveDefinition,
  getDefinition: getDefinition,
  deleteDefinition: deleteDefinition,
  init: init,
  close: close
};

function close(callback){
    store.exitStore(callback);
}

/**
 * Saves the worklfow definition
 * @param workflowDef The workflow definition you wish to save.
 * @param callback A function(err, workflowDef)
 */
function saveDefinition(workflowDef, callback){
  store.saveDefinition(workflowDef, callback);
}

/**
 * Deletes the worklfow definition
 * @param name The name of the workflow definition you wish to delete.
 * @param callback A function(err)
 */
function deleteDefinition(name, callback){
  store.deleteDefinition(name, callback);
}

/**
 * Gets the worklfow definition
 * @param name The name of the workflow definition you wish to retrieve.
 * @param callback A function(err, workflowDef)
 */
function getDefinition(name, callback){
  store.getDefinition(name, callback);
}

/**
 * executes the supplied workflow calls back with the resulting workflow instance.
 * @param workflow The workflow you wish to execute.
 * @param callback A function(err, workflow)
 */
function execute(workflow, callback){
  p.execute(workflow, callback);
}

/**
 * updates an existing workflow with the supplied tasks. i.e. When a an already
 * instantiated workflow has a task in status paused, this function as a callback
 * for any async endpoint wishing to respond.
 * @param workflowId The UUID of the instantiated workflow
 * @param tasks The updated task(s) to be 'injected' into the instantiated workflow
 * @param callback A function(err, workflow)
 */
function updateWorkflow(workflowId, tasks, callback){
  p.updateTasks(workflowId, tasks, callback);
}

/**
 * Sets the log level of the Proessus logger. Default is 'error'
 * @param level The level [debug|verbose|info|warn|error]
 */
function setLogLevel(level){
  logger.level = level;
  return logger;
}

/**
 * Gets an existing instance of a workflow
 * @param workflowId The UUID of the instantiated workflow to get
 * @param rewind through the history of a workflow. i.e. number from 0 last save
*  point, 1 previous save point etc. in continuing reverse chronological order.
 * @param callback A function(err, workflow)
 */
function getWorkflow(workflowId, rewind, callback){
  logger.debug("getWorkflow called");
  store.loadInstance(workflowId, rewind, callback);
}

/**
 * Gets a existing instances of a workflows idenified by query
 * @param query object representing workflows to search for
 * @param callback A function(err, workflow[])
 */
function getWorkflows(query, callback){
  store.getWorkflows(query, callback);
}

/**
 * Delete an existing instance of a workflow
 * @param workflowId The UUID of the instantiated workflow to delete
 * @param callback A function(err)
 */
function deleteWorkflow(workflowId, callback) {
  store.deleteInstance(workflowId, callback);
}

/**
 * Initialise Processus store based on the configured environment variables
 * DB_TYPE default "file" [file | mongo]
 * DATA_DIR default "_data" [file only]
 * DATA_HOST default "localhost" [mongo only]
 * DATA_PORT default 27017 [mongo only]
 * @param callback A function(err)
 */
function init(callback){
  store.initStore(callback);
}

/**
 * Deletes ALL workflow instances
 * @param callback A function(err)
 */
function deleteAll(callback){
  logger.debug("DELETE ALL");
  store.deleteAll(callback);
}
