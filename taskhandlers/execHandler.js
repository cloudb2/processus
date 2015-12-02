var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');

/* Exec Handler
 * Using the Task's parameters.cmd property, this handler will attempt to execute that
 * command as a child process. To spawn a detatched command use background = true and
 * arguments parameters described below.
 * output is stored in parameters.stdout and parameters.stderr (unless background = true)
 * Task INPUT
 * @param task.parameters.cmd The command to execute
 * @param task.parameters.background Set true to spawn and detach the process
    Note: detached processes will write stdout and stderr to [workflowId].logger
 * @param task.parameters.arguments Set to an array of arguments
    Note: arguments are only required for background (spawned) commands
 * Task OUTPUT
 * @param task.parameters.stdout The stdout (if any)
 * @param task.parameters.stderr The stderr (if any)
 * @param task.parameters.pid The child process (if background is true)
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

  if(task.parameters.background === true){
    out = fs.openSync('./' + workflowId + '.log', 'a');
    err = fs.openSync('./' + workflowId + '.log', 'a');
    var child = spawn(task.parameters.cmd, task.parameters.arguments, {
      detached: true,
      stdio: [ 'ignore', out, err ]
    });
    task.parameters.pid = child.pid;
    child.unref();
    callback(null, task);
  }
  else {
    //execute the command and check the response
    exec(task.parameters.cmd, function(error, stdout, stderr) {

      //Set the stdout and stderr properties of the data object in the task
      task.parameters.stdout = stdout.replace(/(\r\n|\n|\r)/gm,"");
      task.parameters.stderr = stderr.replace(/(\r\n|\n|\r)/gm,"");
      if(stdout){ logger.debug("stdout ➜ [" + task.parameters.stdout + "]"); }
      if(stderr){ logger.error(task.parameters.stderr);}
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
  }

};
