var exec = require('child_process').exec;

/* Shell Task Handler
 * Using the Task's data.cmd property, this handler will attempt to execute that
 * command as a child process.
 */
module.exports = function(workflowId, taskName, task, callback, logger){
  //validate that task data element exists
  if(!task.data) {
    callback(new Error("No task data property!"), task);
  }
  //Validate that the data cmd property has been set
  if(!task.data.cmd) {
    callback(new Error("No data cmd property set!"), task);
  }
  //execute the command and check the response
  exec(task.data.cmd, function(error, stdout, stderr) {
    task.data.stdout = stdout;
    task.data.stderr = stderr;
    if(stdout){ logger.debug(stdout); }
    if(stderr){ logger.error(stderr); }
    if(stderr !== ""){
      callback(new Error("Shell failed with: " + stderr), task);
    }
    else {
      logger.info("✔ task " + taskName + " completed successfully.");
      callback(null, task);
    }

  });
};
