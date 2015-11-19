/*!
 * File based storage for Processus
 */
var logger = require('../logger');
var fs = require('fs');
var envParser = require('../envParser');

module.exports = {
  save: save,
  init: init,
  load: load,
  loadDef: loadDef
};

function loadDef(id, callback){

  var workflowTaskFile;

  logger.info("reading workflow file [" + id + "]");

  try {
    workflowTaskFile = fs.readFileSync(id, "utf8");
  }
  catch(err) {
    logger.error("✘ Failed to open JSON file [" + id + "]" + err.message);
    callback(err, null);
    return;
  }

  var workflowTaskJSON;

  //parse and replace any env vars
  workflowTaskFile = envParser.parse(workflowTaskFile);
  
  try {
    workflowTaskJSON = JSON.parse(workflowTaskFile);
  }
  catch(err){
      logger.error("✘ Failed to parse JSON file [" + id + "]" + err.message);
      callback(err, null);
      return;
  }

  callback(null, workflowTaskJSON);
}

function load(id, config, callback) {
  var current = config.dataDirectory + "/" + id;
  fs.readFile(current, function (err, data) {
    var workflowLoaded;
    if (err) {
      logger.error("✘ Unable to find workflow [" + id + "] " + err);
    }
    else {
      workflowLoaded = JSON.parse(data);
    }
    callback(err, workflowLoaded);
  });
}

function init(config, callback){

  var stat;

  try {
    logger.debug("checking for data directory [" + config.dataDirectory + "]");
    stat = fs.statSync(config.dataDirectory);
    callback(null);
  }
  catch(err) {
    try {
      logger.debug("creating data directory [" + config.dataDirectory + "]");
      fs.mkdirSync(config.dataDirectory);
      callback(null);
    }
    catch(error) {
      logger.error("✘ Fatal Error, unable to find or create the data directory. " + error);
      callback(error);
    }
  }
}

function save(workflow, config, callback) {
  var current = config.dataDirectory + "/" + workflow.id;
  //If the file already exists rename it based on current time
  var stat;
  try {
    stat = fs.statSync(current);
    try {
      fs.renameSync(current, current + "_" + Date.now());
      writeCurrent(workflow, current, function(err){
        callback(err);
      });
    }
    catch(renameError) {
      logger.error("✘ Fatal Error, unable to rename existing workflow. " + renameError);
      callback(renameError);
    }
  }
  catch(existsError) {
    writeCurrent(workflow, current, function(err){
      callback(err);
    });
  }
}

function writeCurrent(workflow, current, callback) {
  //Save current workflow
  try {
    fs.writeFileSync(current, JSON.stringify(workflow, null, 2));
    callback(null);
  }
  catch(writeError) {
    callback(writeError);
  }

}
