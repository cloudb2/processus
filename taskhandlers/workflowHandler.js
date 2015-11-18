
var processus = require('../engine/processus');
var fs = require('fs');

/* Workflow Handler
 * using the parameter data.file, this handler will attempt to load the corresponding file
 * execute it and save the resulting workflow output in data.workflow.
 * as with the CLI add data.id to update an existing workflow
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

  var workflowTaskFile;

  try {
    workflowTaskFile = fs.readFileSync(task.data.file, "utf8");
  }
  catch(readErr) {
    logger.error("✘ Failed to open JSON file " + task.data.file + "\n" + readErr.message);
    callback(readErr, task);
  }

  var workflowTaskJSON;

  try {
    workflowTaskJSON = JSON.parse(workflowTaskFile);
  }
  catch(parseErr){
      logger.error("✘ Failed to parse JSON file " + task.data.file + "\n" + parseErr.message);
      callback(parseErr, task);
  }

  if(task.data.id === undefined) {
    processus.execute(workflowTaskJSON, function(err, workflow){
      if(!err) {
        logger.info("✔ Workflow [" + task.data.file + "] completed successfully.");
        logger.debug(JSON.stringify(workflow, null, 2));
        task.data.workflow = workflow;
        callback(null, task);
      }
      else {
        logger.error("✘ " + err.message);
        logger.debug(JSON.stringify(workflow, null, 2));
        callback(err, task);
      }
      return err;
    });
  }
  else {
    processus.updateTasks(task.data.id, workflowTaskJSON, function(err, workflow){
      if(!err) {
        logger.info("✔ Workflow updated successfully.");
        logger.debug(JSON.stringify(workflow, null, 2));
        task.data.workflow = workflow;
        callback(null, task);
      }
      else {
        logger.error("✘ " + err.message);
        logger.debug(JSON.stringify(workflow, null, 2));
        task.data.error = err;
        callback(err, task);
      }
      return err;
    });
  }


};
