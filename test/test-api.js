var processus = require('../engine/api');
var async = require('async');

var wf = {
  "name": "Example Workflow",
  "description": "An example workflow using the API.",
  "tasks":{
    "task 1": {
      "description": "Demo task to execute echo command.",
      "blocking": true,
      "handler" : "../taskhandlers/execHandler",
      "parameters": {
        "cmd": "echo 'Congratulations you called a workflow using the API.'"
      }
    }
  }
};

var logger;
var workflowDefinition;
var workflowInstanceId;

async.series([
  function(callback){setLogLevel(callback);},
  function(callback){init(callback);},
  function(callback){saveDefinition(wf, callback);},
  function(callback){getDefinition("Example Workflow", callback);},
  function(callback){exec(wf, callback);},
  function(callback){getWorkflow(workflowInstanceId, 2, callback);},
  function(callback){exec(wf, callback);},
  function(callback){getWorkflows(callback);},
  function(callback){deleteWorkflow(workflowInstanceId, callback);},
  function(callback){deleteAll(callback);},
  function(callback){deleteDefinition(callback);},
  function(callback){close(callback);}

],

  function(err, results){
    if(err) {
      console.log("reported Error is " + err);
    }
    for(var x=0; x<results.length; x++){
      logger.info("result: " + JSON.stringify(results[x], null, 2));
    }
});

/*
init(function(err){
    if(!err){
      exec(wf, function(err, wf){
        console.log(err);
        console.log(wf);
      });
    }
});
*/

function setLogLevel(callback){
  logger = processus.setLogLevel('info');
  logger.info("setting log level");
  callback(null, "set log level completed");

}

function init(callback){
  processus.init(callback);
}

function exec(workflow, callback) {
  processus.execute(workflow, function(err, wf){
    workflowInstanceId = wf.id;
    callback(err, wf);
  });
}

function getWorkflow(id, rewind, callback){
  processus.getWorkflow(id, 2, function(err, result){
    logger.debug(JSON.stringify(result, null, 2));
    callback(err, "get workflow instance rewind 2 completed with");
  });
}

function saveDefinition(wf, callback){
  processus.saveDefinition(wf, function(err, result){
    logger.debug(JSON.stringify(result, null, 2));
    callback(err, "save definition completed with ");
  });
}

function getDefinition(name, callback){
  processus.getDefinition("Example Workflow", function(err, result){
  logger.debug(JSON.stringify(result, null, 2));
    callback(err, "get definition completed with ");
  });
}

function getWorkflows(callback){
  if(process.env.DB_TYPE === "mongo"){
    logger.info("get workflow(s)");
    processus.getWorkflows({name: "Example Workflow"}, function(err, result){
      callback(err, result);
    });
  }
  else {
    callback(null, "get workflow(s) not called for DB_TYPE file");
  }
}

function deleteWorkflow(id, callback) {
  processus.deleteWorkflow(id, function(err){
    callback(err, "delete instance completed");
  });
}

function deleteAll(callback) {
  processus.deleteAll(function(err){
    callback(err, "delete all completed");
  });
}

function deleteDefinition(callback){
  processus.deleteDefinition("Example Workflow", function(err){
    callback(err, "delete definition completed");
  });
}

function close(callback){
  processus.close(function(err){
    callback(err, "processus closed");
  });
}
