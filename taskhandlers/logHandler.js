
/* Log Handler
 * Logs a the supplied message
 * Task INPUT
 * @param task.parameters.level The log level
 * @param task.parameters.log The message to log
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.parameters) {
    callback(new Error("Task [" + taskName + "] has no parameters property!"), task);
    return;
  }

  switch(task.parameters.level){
    case "info":
      logger.info(task.parameters.log);
      break;
    case "debug":
      logger.debug(task.parameters.log);
      break;
    case "error":
      logger.error(task.parameters.log);
      break;
    case "verbose":
      logger.verbose(task.parameters.log);
      break;
    case "warn":
      logger.warn(task.parameters.log);
      break;
    default:
      logger.warn("logHander failed to find loglevel [" + task.parameters.level + "] in task ["+ taskName + "]");
  }

  callback(null, task);

};
