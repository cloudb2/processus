
/* Log Handler
 *
 * Set task.data.level for log level
 * Set task.data.log for log message
*/
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.data) {
    callback(new Error("Task [" + taskName + "] has no data property!"), task);
    return;
  }

  switch(task.data.level){
    case "info":
      logger.info(task.data.log);
      break;
    case "debug":
      logger.debug(task.data.log);
      break;
    case "error":
      logger.error(task.data.log);
      break;
    case "verbose":
      logger.verbose(task.data.log);
      break;
    case "warn":
      logger.warn(task.data.log);
      break;
    default:
      logger.warn("logHander failed to find loglevel " + task.data.level);
  }

  callback(null, task);

};
