
var processus = require('../engine/processus');
var fs = require('fs');
/* Test Task Handler
 * Simply logs the task and returns in accordance with the supplied data
 * Options are:
 * Set task.data.error = true to raise an error
 * Set task.data.delay to set the time in msecs that the task should delay
*/
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;
  if(!task.data) {
    callback(new Error("No task data property!"), task);
  }

  //Validate that the data cmd property has been set
  if(!task.data.file) {
    callback(new Error("No data file property set!"), task);
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
        logger.info("✔ Workflow completed successfully.");
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
