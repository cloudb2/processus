var exec = require('child_process').exec;

/* Shell Task Handler
 * Using the Task's data.cmd property, this handler will attempt to execute that
 * command as a child process.
 */
module.exports = function(workflowId, taskName, task, callback, logger){
  //validate that task data element exists
  if(!task[taskName].data) {
    callback(new Error("No task data property!"), task[taskName]);
  }
  //Validate that the data cmd property has been set
  if(!task[taskName].data.cmd) {
    callback(new Error("No data cmd property set!"), task[taskName]);
  }
  //execute the command and check the response
  exec(task[taskName].data.cmd, function(error, stdout, stderr) {
    task[taskName].data.stdout = stdout;
    task[taskName].data.stderr = stderr;
    if(stdout){ logger.info(stdout); }
    if(stderr){ logger.error(stderr); }
    //let the processus know what happened
    callback(error, task);
  });
};
