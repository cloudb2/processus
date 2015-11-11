
/* Test Task Handler
 * Simply logs the task and returns in accordance with the supplied data
 * Options are:
 * Set task.data.error = true to raise an error
 * Set task.data.delay to set the time in msecs that the task should delay
*/
module.exports = function(workflowId, taskName, task, callback, logger){

  logger.debug("workflow ID " + workflowId);
  logger.debug("testHandler:\n executing " + taskName);
  logger.debug("Task Description:\n " + task.description);
  logger.debug(taskName + ":" + JSON.stringify(task, null, 2));
  var err;

  if(task.data.error === true){
      err = new Error("This is an error from the task " + taskName);
  }

  if(task.data.pending === true){
      task.status = "pending";
  }

  var timeout = 0;

  if(task.data.delay) {
    timeout=task.data.delay;
  }

  setTimeout(function(){
    logger.info("✔ task " + taskName + " completed successfully.");
    callback(err, task);
  }, timeout);

};
