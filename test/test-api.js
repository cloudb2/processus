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

try {
  async.series([
    function(callback) {
      logger = processus.setLogLevel('info');
      logger.info("setting log level");
      callback(null, "set log level completed");
    },
    function(callback) {
      logger.info("calling init");
      processus.init(function(err){
        callback(err, "init completed");
      });
    },
    function(callback) {
      logger.info("saving definition");
      processus.saveDefinition(wf, function(err, result){
        callback(err, "save definition completed with " + JSON.stringify(result, null, 2));
      });
    },
    function(callback){
      logger.info("get definition");
      processus.getDefinition("Example Workflow", function(err, result){
        workflowDefinition = result;
        callback(err, "get definition completed with " + JSON.stringify(result, null, 2));
      });
    },
    function(callback){
      logger.info("execute definition");
      processus.execute(workflowDefinition, function(err, result){
        workflowInstanceId = result.id;
        callback(err, "execute definition completed with " + JSON.stringify(result, null, 2));
      });
    },
    function(callback){
      logger.info("get workflow instance rewind 2");
      processus.getWorkflow(workflowInstanceId, 2, function(err, result){
        callback(err, "get workflow instance rewind 2 completed with " + JSON.stringify(result, null, 2));
      });
    },
    function(callback){
      logger.info("execute definition again");
      processus.execute(workflowDefinition, function(err, result){
        workflowInstanceId = result.id;
        callback(err, "execute definition again completed with " + JSON.stringify(result, null, 2));
      });
    },
    function(callback){
      if(process.env.DB_TYPE === "mongo"){
        logger.info("get workflow(s)");
        processus.getWorkflows({name: "Example Workflow"}, function(err, result){
          callback(err, "get workflow(s) completed with " + JSON.stringify(result, null, 2));
        });
      }
      else {
        callback(null, "get workflow(s) not called for DB_TYPE file");
      }
    },
    function(callback){
      logger.info("delete instance");
      processus.deleteWorkflow(workflowInstanceId, function(err){
        callback(err, "delete instance completed");
      });
    },
    function(callback){
      logger.info("delete all instance");
      processus.deleteAll(function(err){
        callback(err, "delete all completed");
      });
    },
    function(callback){
      logger.info("delete definition");
      processus.deleteDefinition("Example Workflow", function(err){
        callback(err, "delete definition completed");
      });
    },
    function(callback){
      logger.info("closing processus");
      processus.close(function(err){
        callback(err, "processus closed");
      });
    }
  ],
  function(err, results){
    if(err) throw err;
    for(var x=0; x<results.length; x++){
      logger.info("result: " + results[x]);
    }
  });
}
catch(err){
  logger.error(err);
}
