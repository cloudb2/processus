var p = require('./processus');
var logger = require('./logger');
var store = require('./persistence/store');

logger.level = 'error';

module.exports = {
  execute: execute,
  updateWorkflow: updateWorkflow,
  setLogLevel: setLogLevel,
  getWorkflow: getWorkflow,
  deleteWorkflow: deleteWorkflow,
  deleteAll: deleteAll
};

/**
 * executes the supplied workflow and calls back with the resulting workflow.
 * @param workflow The workflow definition you wish to execute.
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
}

/**
 * Gets an existing instance of a workflow
 * @param workflowId The UUID of the instantiated workflow to get
 * @param rewind through the history of a workflow. i.e. number from 0 last save
*  point, 1 previous save point etc. in continuing reverse chronological order.
 * @param callback A function(err, workflow)
 */
function getWorkflow(workflowId, rewind, callback){
  store.loadInstance(workflowId, rewind, callback);
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
 * Deletes ALL workflow instances
 * @param callback A function(err)
 */
function deleteAll(callback){
  store.deleteAll(callback);
}
