
var processus = require('../engine/processus');
var store = require('../engine/persistence/store');

/* Workflow Handler
 * This handle will attempt to load supplied file or execute the supplied workflow
 * Task INPUT
 * @param task.parameters.file The workflow definition file name (if no workflow supplied)
 * @param task.parameters.workflow A workflow object to execute
 * Task OUTPUT
 * @param task.parameters.workflow The resulting workflow object
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;
  if(!task.parameters) {
    callback(new Error("Task [" + taskName + "] has no parameters property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.parameters.file) {
    callback(new Error("Task [" + taskName + "] has no parameters.file property set!"), task);
    return;
  }

  var workflowTaskJSON;

  if(task.parameters.workflow === undefined) {
    store.loadDefinition(task.parameters.file, function(err, workflowFile){
      if(!err){
        workflowTaskJSON = workflowFile;
      }
    });
    if(workflowTaskJSON === undefined){
      callback(new Error("Unable to find workflow definition [" + task.parameters.file + "] in task ["+ taskName + "]"), task);
      return;
    }
  }
  else {
    workflowTaskJSON = task.parameters.workflow;
  }

  processus.runWorkflow(task.parameters.file, task.parameters.id, workflowTaskJSON, function(err, workflow){
    task.parameters.workflow = workflow;
    callback(err, task);
  });


};
