
/* Test Task Handler
 * Simply logs the task and returns in accordance with the supplied data
 * Options are:
 * Set task.data.error = true to raise an error
 * Set task.data.delay to set the time in msecs that the task should delay
 * Set task.data.pedning = true to mimic a pending task
*/
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.data) {
    callback(new Error("Task [" + taskName + "] has no data property!"), task);
    return;
  }

  //Mimic an error if asked?
  if(task.data.error === true){
    err = new Error("task [" + taskName + "] is raising a deliberate error");
  }

  //mimic a pending status if asked?
  if(task.data.pending === true){
    task.status = "pending";
  }

  //Get time out and wait accordingly
  var timeout = 0;
  if(task.data.delay) {
    timeout=task.data.delay;
  }
  setTimeout(function(){
    logger.info("✔ task " + taskName + " completed successfully.");
    callback(err, task);
  }, timeout);

};
