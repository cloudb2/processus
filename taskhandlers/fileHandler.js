var fs = require('fs');

/* File Handler
 * The file handler loads or saves the specified file
 * When loading a file it will attempt to parse the file as JSON, if successful
 * the resulting object will be stored in the paramaters of the task, if not,
 * the contents will be stored as a string. (i.e. this is not intended for binary files)
 * Saving the file will also be in JSON format
 *
 * @param task.parameters.file.name The filename (including a path as needed)
 * @param task.parameters.file.contents The contents of the file (if null or undefined)
 * a load operation is implied.
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  try {

    //validate that task data element exists
    if(!task.parameters) {
      logger.debug("No task parameters property!");
      callback(new Error("Task [" + taskName + "] has no task parameters property!"), task);
      return;
    }

    //validate that task data element exists
    if(!task.parameters.file) {
      logger.debug("No task parameters.file property!");
      callback(new Error("Task [" + taskName + "] has no task parameters.file property!"), task);
      return;
    }

    var fileContents = {};

    if(task.parameters.file.contents === null ||
       task.parameters.file.contents === undefined){
      //Assuming a read is required.
      fileContents = fs.readFileSync(task.parameters.file.name, "utf8");
      try {
        fileContents = JSON.parse(fileContents);
      }
      catch(jsonParseError){
        //leave contents as invalid json but a string
      }

      task.parameters.file.contents = fileContents;

    }
    else {
      fileContents = JSON.stringify(task.parameters.file.contents, null, 2);
      fs.writeFileSync(task.parameters.file.name, fileContents);
    }
    callback(null, task);
  }
  catch(fileHandlerError){
    callback(fileHandlerError);
  }

};
