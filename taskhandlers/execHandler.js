var exec = require('child_process').exec;

/* Shell Task Handler
 * Using the Task's data.cmd property, this handler will attempt to execute that
 * command as a child process.
 * output is stored in data.stdout and data.stderr
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.data) {
    logger.debug("No task data property!");
    callback(new Error("Task [" + taskName + "] has no task data property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.data.cmd) {
    callback(new Error("Task [" + taskName + "] has no data.cmd property set!"), task);
    return;
  }

  //execute the command and check the response
  exec(task.data.cmd, function(error, stdout, stderr) {

    //Set the stdout and stderr properties of the data object in the task
    task.data.stdout = stdout;
    task.data.stderr = stderr;
    if(stdout){ logger.info("stdout ➜ [" + stdout + "]"); }
    if(stderr){ logger.error(stderr); }
    if(error){
      callback(new Error("exec failed with: [" + error.message + "]"), task);
      return;
    }
    if(stderr !== ""){
      callback(new Error("exec failed with: [" + stderr + "]"), task);
    }
    else {
      logger.info("✔ task [" + taskName + "] completed successfully.");
      callback(null, task);
    }

  });
};
