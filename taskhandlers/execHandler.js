var exec = require('child_process').exec;

/* Exec Handler
 * Using the Task's parameters.cmd property, this handler will attempt to execute that
 * command as a child process.
 * output is stored in parameters.stdout and parameters.stderr
 * Task INPUT
 * @param task.parameters.cmd The command to execute
 * Task OUTPUT
 * @param task.parameters.stdout The stdout (if any)
 * @param task.parameters.stderr The stderr (if any)
 *
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.parameters) {
    logger.debug("No task data property!");
    callback(new Error("Task [" + taskName + "] has no task parameters property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.parameters.cmd) {
    callback(new Error("Task [" + taskName + "] has no parameters.cmd property set!"), task);
    return;
  }

  //execute the command and check the response
  exec(task.parameters.cmd, function(error, stdout, stderr) {

    //Set the stdout and stderr properties of the data object in the task
    task.parameters.stdout = stdout;
    task.parameters.stderr = stderr;
    if(stdout){ logger.debug("stdout ➜ [" + stdout + "]"); }
    if(stderr){ logger.error(stderr); }
    if(error){
      callback(new Error("exec failed with: [" + error.message + "] in task ["+ taskName + "]"), task);
      return;
    }
    if(stderr !== ""){
      callback(new Error("exec failed with: [" + stderr + "] in task ["+ taskName + "]"), task);
    }
    else {
      //logger.info("✔ task [" + taskName + "] completed successfully.");
      callback(null, task);
    }

  });
};
