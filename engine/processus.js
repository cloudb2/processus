/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * processus.js: The main engine, where the work gets done
 */

var logger = require('./logger');
require('dotenv').load({silent: true});
var async = require("async");
var uuid = require("node-uuid");
var store = require('./persistence/store');
var _ = require("underscore");

module.exports = {
  execute: execute,
  updateTasks: updateTasks,
  runWorkflow: runWorkflow
};

function runWorkflow(defId, id, workflowTaskJSON, callback) {
  if (id === null || id === undefined) {

    execute(workflowTaskJSON, function(err, workflow){
      if(!err) {
        logger.debug("Workflow returned successfully.");
        logger.debug(JSON.stringify(workflow, null, 2));
        if(workflow.status === "completed"){
          logger.info("✰ Workflow [" + defId + "] with id [" + workflow.id + "] completed successfully.");
        }
        else {
          logger.info("✰ Workflow [" + defId + "] with id [" + workflow.id + "] exited without error, but did not complete.");
        }
      }
      else {
        logger.error("✘ " + err.message);
        logger.error("✘ Workflow [" + defId + "] with id [" + workflow.id + "] exited with error!");
        logger.debug(JSON.stringify(workflow, null, 2));
      }
      callback(err, workflow);
    });
  }

  if(id !== null && id !== undefined){
    updateTasks(id, workflowTaskJSON, function(err, workflow){
      if(!err) {
        logger.debug("Workflow returned successfully.");
        logger.debug(JSON.stringify(workflow, null, 2));
        if(workflow.status === "completed"){
          logger.info("✰ Workflow [" + defId + "] with id [" + id + "] updated successfully.");
        }
      }
      else {
        logger.error("✘ " + err.message);
        logger.error("✘ Workflow [" + defId + "] with id [" + id + "] failed to update with error!");
        logger.debug(JSON.stringify(workflow, null, 2));
      }
      callback(err, workflow);
    });
  }

}

function updateTasks(id, tasks, callback){

  store.loadInstance(id, 0, function(err, workflow){
    if(!err){
      if(workflow.status !== "completed") {
        workflow = mergeTasks(workflow, tasks);
        execute(workflow, callback);
      }
      else {
        callback(new Error("Update failed, workflow [" + id + "] has already completed!"));
      }
    }
    else {
      callback(err);
    }
  });
}

function mergeTasks(workflow, tasks) {
    function makeTaskHandler(taskName) {
      return function taskHandler(task, name) {
        if(taskName == name) {
          mergeTask(task, tasks[taskName]);
          return false;
        }
        else {
          //continue scanning
          return true;
        }
      };
    }
    taskNames = Object.keys(tasks);
    for(var x=0; x<taskNames.length; x++){
      scanAllTasks(workflow.tasks, true, makeTaskHandler(taskNames[x]));
    }
    return workflow;
}

function mergeTask(originalTask, newTask){
  //A Handler can only change the data status, conditions and any sub tasks.
  originalTask.parameters = newTask.parameters;
  originalTask.status = newTask.status;
  originalTask.errorIf = newTask.errorIf;
  originalTask.skipIf = newTask.skipIf;
  originalTask.tasks = newTask.tasks;
  //now update time completed
  originalTask.timeCompleted = Date.now();
  originalTask.totalDuration = originalTask.timeCompleted - originalTask.timeOpened;
}

function addEnvVars(workflow){

  var vars = Object.keys(process.env);
  workflow.environment = {};
  for(var x=0; x<vars.length; x++){
    workflow.environment[vars[x]] = process.env[vars[x]];
  }
  return workflow;

}

/**
 * Executes the supplied workflow for this instance of the processus engine.
 *
 * @param {object} The workflow definition as a JSON object
 * @returns {object} The validated and updated workflow object
 */
function execute(workflow, callback){

  //add environment vars to workflow parameters
  workflow = addEnvVars(workflow);

  //Validate workflow
  workflow = validateWorkflow(workflow);

  logger.debug("Validated workflow: " + workflow);

  //Do pre-workflow Task
  doPre(workflow, function(err, workflow){
      if(!err) {
        realExecute(workflow, function(err, workflow){
          if(!err){
            doPost(workflow, function(err, workflow){
              callback(err, workflow);
            });
          }
          else {
            //execute workflow failed, so callback
            callback(err, workflow);
            return;
          }
        });
      }
      else {
        //pre workflow failed, so callback
        callback(err, workflow);
        return;
      }
  });
  //return workflow;
}

function doPre(workflow, callback){

  var task = workflow['pre workflow'];
  executePrePost(workflow, "pre workflow", task, callback);

}

function doPost(workflow, callback){
  var task = workflow['post workflow'];
  executePrePost(workflow, "post workflow", task, callback);
}

function executePrePost(workflow, taskName, task, callback){
  if(task !== undefined && task !== null) {
    setTaskDataValues(workflow, task);
    setConditionValues(task);
    task.status = "executing";
    task.timeOpened = Date.now();
    executeTask(workflow.id, taskName, task, function(err, taskObject){
      callback(err, workflow);
    });
  }
  else {
    //Nothing to do, so carry on
    callback(null, workflow);
  }
}

//Validate the supplied workflow and remove any non-JSON things, like functions!
//Sets the initial status of ALL the tasks to 'waiting'
function validateWorkflow(workflow){
  //convert supplied "JSON" object to string and then back again, thus ensuring
  //it really is just JSON (i.e. any evil functions will be ignored)
  var sWorkflow = JSON.stringify(workflow);
  workflow = JSON.parse(sWorkflow);

  //initialise the status of tasks within the workflow
  setTaskStatusWaiting(workflow);

  //Set workflow UUID if not already present.
  if(workflow.id === undefined) {
    workflow.id = uuid.v4();
  }

  //return the result
  return workflow;

}

//Returns all the tasks that have the supplied status, starting at the parent
//and recursing into child tasks if deep = true
function getTasksByStatus(parent, status, deep) {
  var openTasks={};
  scanAllTasks(parent.tasks, deep, function(task, name){
    if(task.status === status){
      openTasks[name] = task;
    }
    return true;

  });
  return openTasks;

}

function executeTask(workflowId, taskName, taskObject, callback){

    taskObject.timeStarted = Date.now();
    logger.debug("task.skipIf = " + taskObject.skipIf);
    logger.debug("task.errorIf = " + taskObject.errorIf);
    var skip = (taskObject.skipIf === true ||
                taskObject.errorIf === true ||
                taskObject.handler === '' ||
                taskObject.handler === undefined);

    //Set handler executed based on skip evaluation
    taskObject.handlerExecuted = !skip;

    if (!skip) {
      //No error or skip condition so execute handler
      logger.info("⧖ Starting task [" + taskName + "]");
      try {
        require(taskObject.handler)(workflowId, taskName, taskObject, function(err, taskObjectreturned){
          //handler returned, check if there's an error
          if(err) {
            //there is, so set it on the task
            taskObjectreturned.errorMsg = err.message;
            taskObjectreturned.status = "error";
            //Should we ignore the error?
            if(taskObjectreturned.ignoreError === true) {
              logger.info("ignoring error, as requested for task [" + taskName + "]");
              taskObjectreturned.status = 'executing';
              //reset err object
              err = undefined;
            }
          }
          else {
            logger.info("✔ task " + taskName + " completed successfully.");
          }
          //If the task is executing mark it as completed and update times
          if(taskObjectreturned.status === 'executing'){
            taskObjectreturned.status = 'completed';
            taskObjectreturned.timeCompleted = Date.now();
            taskObjectreturned.handlerDuration = taskObjectreturned.timeCompleted - taskObjectreturned.timeStarted;
            taskObjectreturned.totalDuration = taskObjectreturned.timeCompleted - taskObjectreturned.timeOpened;
          }
          //If the task is paused (as marked by the hander) then we assume
          //an async call that will return in the future
          if(taskObjectreturned.status === 'paused'){
            taskObjectreturned.handlerDuration = Date.now() - taskObjectreturned.timeStarted;
          }
          //callback to Async
          callback(err, taskObjectreturned);
        }, logger);
      }
      catch(requireError) {
        taskObject.errorMsg = requireError.message;
        taskObject.status = "error";
        callback(new Error("Possible missing module or other unexpected error! " + requireError), taskObject);
      }
    }
    else {
      if(taskObject.skipIf === true) {
        logger.debug("skipping handler for task [" + taskName + "]");
      }
      //Ok, we're skipping the handler is that because errorIf is true?
      var err = null;
      if (taskObject.errorIf === true) {
        err = new Error("Task [" + taskName + "] has error condition set.");
        taskObject.errorMsg = err.message;
        taskObject.status = "error";
      }
      //If it's exeucuting but has no handler (i.e. it could just be a parent place holder task),
      //mark it completed.
      if(taskObject.status === 'executing'){
        taskObject.status = 'completed';
        taskObject.timeCompleted = Date.now();
        taskObject.handlerDuration = taskObject.timeCompleted - taskObject.timeStarted;
        taskObject.totalDuration = taskObject.timeCompleted - taskObject.timeOpened;
      }
      //call back to Async, with error if necessary.
      callback(err, taskObject);
    }

}

//Execute the resulting workflow asynchronously recursing for each next set of tasks
function realExecute(workflow, callback) {

  store.saveInstance(workflow, function(err){
    logger.debug("save point a reached.");
    if(err){
      callback(err, workflow);
      return;
    }

    //Check there's any paused tasks, if so we assume Async and exit current workflow
    var pausedTasks = getTasksByStatus(workflow, 'paused', true);
    var pausedTaskNames = Object.keys(pausedTasks);
    if(pausedTaskNames.length > 0) {
      logger.debug("found paused task(s) so returning immediately");
      callback(null, workflow);
      return;
    }

    //Open any waiting (and available) tasks
    openNextAvailableTask(workflow);

    //Get a list of ALL the open tasks
    var openTasks = getTasksByStatus(workflow, 'open', true);
    var taskNames = Object.keys(openTasks);

    //Initialise the task execution queue
    var taskExecutionQueue = [];

    //This function will return a function to be used by async that calls the
    //appopriate handler (as defined by the task)
    function makeTaskExecutionFunction(x){
      return function(callback){
        var taskName = taskNames[x];
        var taskObject = openTasks[taskNames[x]];
        executeTask(workflow.id, taskName, taskObject, callback);
      };
    }

    //Now cycle through the open tasks, check them to see if they can be executed,
    //and if so, pushed onto the queue
    for (var x=0; x<taskNames.length; x++){

      //make a new execution function ready for async
      var taskFunction = makeTaskExecutionFunction(x);

      //get the task t
      var t = openTasks[taskNames[x]];

      //if the task is open and has no children, queue it to execute
      if(t.status === 'open' && !t.tasks){
        setTaskDataValues(workflow, t);
        setConditionValues(t);
        t.status = "executing";
        taskExecutionQueue.push(taskFunction);
      }
      //if the task has children, but they're ALL completed, queue it to execute
      if(t.status === 'open' && t.tasks){
        if(childHasStatus(t, 'completed', true)){
          setTaskDataValues(workflow, t);
          setConditionValues(t);
          t.status = "executing";
          taskExecutionQueue.push(taskFunction);
        }
      }
    }

    //Assuming we actually have any valid tasks to execute, let async call them in parallel
    if(taskExecutionQueue.length > 0) {

      //Now execute open tasks
      async.parallel(taskExecutionQueue,
        //function callback for async when all tasks have finsihed or an error has occured
        function(error, results) {
          //if no error then cycle through results and update the task statuses
          if(!error) {
            //ok, all done and no error, so recurse into next set of tasks (if any)
            realExecute(workflow, callback);
          }
          else {

            //Now set the overall workflow to error
            workflow.status = 'error';
            store.saveInstance(workflow, function(err){
              logger.debug("save point b reached.");

              if(err){
                callback(err, workflow);
                return;
              }
              else {
                callback(error, workflow);
              }
            });

          }
        });
    }
    else {
      //check if ALL tasks are completed, if so, set the workflow status
      if(childHasStatus(workflow, 'completed', true)){
        workflow.status = 'completed';
      }
      store.saveInstance(workflow, function(err){
        logger.debug("save point c reached.");
        //None left in the queue so callback

        if(err){
          callback(err, workflow);
          return;
        }
        else {
          callback(null, workflow);
        }
      });

    }

  });

}

//check data values and look out for $[] references and update the value accordingly
function setTaskDataValues(workflow, task){


  var taskProperties = Object.keys(task);

  taskProperties.map(function(propertyKey){

    var prop = task[propertyKey];

    //convert whole task to JSON string
    var propStr = JSON.stringify(prop, null, 2);

    logger.debug("checking for $[] in " + propStr);
    //Now look for matching '$[]' references
    refValues = propStr.match(/[$](\[(.*?)\])/g);

    if(refValues) {

      //Cycle through fetching the ref values and replacing
      for(var x=0; x<refValues.length; x++){

        //get current ref value
        refValue = refValues[x];

        //remove the '$[]' chars
        refValue = refValue.substring(2, refValue.length -1);

        //get env var
        dataValue = getData(workflow, refValue);
        if(dataValue === undefined){
          dataValue = null;
        }

        if (typeof dataValue === 'string' || dataValue instanceof String) {
          //literally replace env ref with value
          dataValue = dataValue
                        .replace(/[\\]/g, '\\\\')
                        .replace(/[\/]/g, '\\/')
                        .replace(/[\b]/g, '\\b')
                        .replace(/[\f]/g, '\\f')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r')
                        .replace(/[\t]/g, '\\t')
                        .replace(/[\"]/g, '\\"')
                        .replace(/\\'/g, "\\'");
                        
          propStr = "" + propStr.replace(refValues[x], dataValue);
        }
        else {
            //ok, not a string, so replace quotes wrapping the path and JSON stringify it
            //in case it's a complete object. i.e. allow the passing of objects.
            var beforeStr = propStr.replace('"' + refValues[x] + '"', JSON.stringify(dataValue, 2, null));
            //if nothing changed, then it may not be a string, but it's part of a
            //new string, so just replace it as is
            if(propStr == beforeStr){
              propStr = propStr.replace(refValues[x], dataValue);
            }
            else {
              propStr = propStr.replace('"' + refValues[x] + '"', JSON.stringify(dataValue, 2, null));
            }
        }

      }

    }
    task[propertyKey] = JSON.parse(propStr);

  });
}

//Init all tasks to waiting and set workflow status to open
function setTaskStatusWaiting(workflow){
  workflow.status = 'open';
  scanAllTasks(workflow.tasks, true, function(task, name){
    if(!task.status) {
      task.status = 'waiting';
    }
    //continue scanning
    return true;
  });
}

//childHasStatus returns true if at least one of the children have the matching status
//Set all to true if ALL children should match that status
function childHasStatus(parent, status, all){

  var matchStatus = false;
  //are there child tasks, if not, return false;
  if(!parent.tasks) { return false; }

  scanAllTasks(parent.tasks, true, function(task, name){
      matchStatus = (task.status === status);
      if(matchStatus && !all) {
        //exit out of the scan
        return false;
      }
      if(!matchStatus && all){
        //exit out of the scan
        return false;
      }
      //continue scanning & checking
      return true;
  });

  return matchStatus;
}

//opens next available tasks and reurns if true if there are any waiting
function openNextAvailableTask(workflow){
  openTasks(workflow.tasks);
  //return true if there are any open tasks
  return childHasStatus(workflow, 'open', false);
}

//open any tasks that are 'ready' to be opened
function openTasks(tasks) {

  scanAllTasks(tasks, false, function(task, name){
    //If... we're still updating, the task is waiting and none of its children are waiting
    if(task.status ==='open'){
      //task is open, but does it have ANY children waiting?
      if(childHasStatus(task, 'waiting', false)){
        //it does, so let's go down and check those first
        openTasks(task.tasks);
      }
      //if the task is blocking return false to signify to scanAllTasks that we don't
      //to continue scanning
      return !isBlocking(task);
    }

    //the task is waiting, so let's open it and check its children (if any)
    if(task.status === "waiting"){
      task.status = 'open';
      task.timeOpened = Date.now();
      //we've opened the task, so open it's children (if any)
      if(task.tasks){
        openTasks(task.tasks);
      }
      //if the task is blocking, then don't continue
      return !isBlocking(task);
    }

    //carry on!
    return true;
  });
}

//scan all tasks calling callback for each task a bit like 'map' for tasks
//set deep to true to recursively scan children
function scanAllTasks(tasks, deep, callback){
  var scanning = true;
  var taskNames = Object.keys(tasks);
  for (var x=0; x<taskNames.length; x++){
    //if the callback returns false then break
    scanning = callback(tasks[taskNames[x]], taskNames[x]);
    if (!scanning){
        //bubble up
        break;
    }
    //does the task have children, if scan recursively
    if(tasks[taskNames[x]].tasks && deep){
      scanning = scanAllTasks(tasks[taskNames[x]].tasks, true, callback);
      if (!scanning){
          break;
      }
    }
  }
  return scanning;
}

//get the data value of the task as reference by the . notation path
function getData(workflow, path){
  logger.debug("Getting data for path: " + path);
  pathElements = path.split(".");
  var obj = workflow;
  for (var x=0; x<pathElements.length; x++){
    //bug fix, only keep following the path if the object isn't undefined
    if(obj !== undefined) {
      obj = obj[pathElements[x]];
    }
  }

  if(obj === undefined){
    //it's undefined, so we can't get the data, that may be valid.... or not!
    logger.warn("Unable to get value for path " + path + " in workflow. Did you set the path correctly?");
  }
  return obj;
}


function setConditionValues(task){
  //now evaluate any conditions (if any)
  if(task.skipIf !== undefined) {
    task.skipIf = getBoolean(task.skipIf);
  }
  if(task.errorIf !== undefined) {
    task.errorIf = getBoolean(task.errorIf);
  }
}

function isBlocking(task) {
  var blocking = getBoolean(task.blocking);
  return blocking;
}


function getBoolean(value) {
  //Is it a boolean anyway?
  if(_.isBoolean(value)) {
    return value;
  }
  if(_.isString(value)) {
    return (value.toLowerCase() === "true");
  }
  return false;
}

function exitHandler(options, err) {
  logger.debug("Processus is exiting..");
  store.exitStore(function(err){
    logger.debug("GOODBYE: Cheerio!");
    if (options.cleanup) logger.debug("Exit is clean");
    if (err) logger.error(err.stack);
    if (options.exit) process.exit();
  });

}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
