
var processus = require('../engine/processus');
var store = require('../engine/persistence/store');

/* Workflow Handler
 * This handle will attempt to load supplied file or execute the supplied workflow
 * INPUT
 * @param task.data.file The workflow definition file name (if no workflow supplied)
 * @param task.data.workflow A workflow object to execute
 * OUTPUT
 * @param task.data.workflow The resulting workflow object
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;
  if(!task.data) {
    callback(new Error("Task [" + taskName + "] has no data property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.data.file) {
    callback(new Error("Task [" + taskName + "] has no data.file property set!"), task);
    return;
  }

  var workflowTaskJSON;

  if(task.data.workflow === undefined) {
    store.loadDefinition(task.data.file, function(err, workflowFile){
      if(!err){
        workflowTaskJSON = workflowFile;
      }
    });
    if(workflowTaskJSON === undefined){
      callback(new Error("Unable to find workflow definition [" + task.data.file + "]"), task);
      return;
    }
  }
  else {
    workflowTaskJSON = task.data.workflow;
  }

  processus.runWorkflow(task.data.file, task.data.id, workflowTaskJSON, function(err, workflow){
    task.data.workflow = workflow;
    callback(err, task);
  });


};
