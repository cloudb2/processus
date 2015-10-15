
/* Test Task Handler
 * Simply logs the task and returns in accordance with the supplied data
 * Options are:
 * Set task.data.error = true to raise an error
 * Set task.data.delay to set the time in msecs that the task should delay
*/
module.exports = function(name, task, callback, logger){

  logger.info("testHandler:\n executing " + name);
  logger.info("Task Description:\n " + task.description);
  logger.debug(name + ":" + JSON.stringify(task, null, 2));
  var err;

  if(task.data.error === true){
      err = new Error("This is an error from the task " + name);
  }

  var timeout = 0;

  if(task.data.delay) {
    timeout=task.data.delay;
  }

  setTimeout(function(){
    logger.info("testHandler:\n completed " + name);
    callback(err, task);
  }, timeout);

};
