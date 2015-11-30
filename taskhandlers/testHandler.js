
/* Test Handler
 * Used to test tasks within a workflow
 * Task INPUT
 * @param task.parameters.error Set true to simulate an error
 * @param task.parameters.delay Set delay time (msecs) to simulate execution before returning
 * @param task.parameters.paused Set true to simulate a paused status returned from a module
*/
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.parameters) {
    callback(new Error("Task [" + taskName + "] has no parameters property!"), task);
    return;
  }

  //Mimic an error if asked?
  if(task.parameters.error === true){
    err = new Error("task [" + taskName + "] is raising a deliberate error");
  }

  //mimic a paused status if asked?
  if(task.parameters.paused === true){
    task.status = "paused";
  }

  //Get time out and wait accordingly
  var timeout = 0;
  if(task.parameters.delay) {
    timeout=task.parameters.delay;
  }
  setTimeout(function(){
    //logger.info("✔ task " + taskName + " completed successfully.");
    callback(err, task);
  }, timeout);

};
