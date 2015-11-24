
/* Test Handler
 * Used to test tasks within a workflow
 * INPUT
 * @param task.data.error Set true to simulate an error
 * @param task.data.delay Set delay time (msecs) to simulate execution before returning
 * @param task.data.pending Set true to simulate a pending status returned from a module
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
