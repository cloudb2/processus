/*!
 * File based storage for Processus
 */
var logger = require('../logger');
var fs = require('fs');
var envParser = require('../envParser');
var glob = require('glob');

var initialised = false;

module.exports = {
  deleteInstance: deleteInstance,
  loadDefinition: loadDefinition,
  loadInstance: loadInstance,
  initStore: initStore,
  saveInstance: saveInstance,
  deleteAll: deleteAll
};

function deleteAll(config, callback){
  glob(config.dataDirectory + "/*", function (err, files) {

    if(files) {
      files.map(function(file){
        fs.unlink(file, function (err) {
          if (err) {
            logger.error("✘ Unable to delete workflow [" + file + "] " + err);
            callback(err);
            return;
          }
          logger.info("successfully deleted workflow history [" + file + "]");
        });
      });
    }
    else {
      logger.error("✘ Unable to find workflow [" + id + "] " + err);
    }

  });
}

function deleteInstance(id, config, callback){
  var current = config.dataDirectory + "/" + id;

  fs.unlink(current, function (err) {
    if (err) {
      logger.error("✘ Unable to delete workflow [" + id + "] " + err);
      callback(err);
      return;
    }
    logger.info("successfully deleted workflow [" + id + "]");
  });

  glob(current + "_*", function (err, files) {

    if(files) {
      files.map(function(file){
        fs.unlink(file, function (err) {
          if (err) {
            logger.error("✘ Unable to delete workflow [" + file + "] " + err);
            callback(err);
            return;
          }
          logger.info("successfully deleted workflow history [" + file + "]");
        });
      });
    }
    else {
      logger.error("✘ Unable to find workflow [" + id + "] " + err);
    }

  });

}

function loadDefinition(id, callback){

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

function loadInstance(id, rewind, config, callback) {
  var current = config.dataDirectory + "/" + id;
  glob(current + "_*", function (err, files) {

    if(files) {
      if(rewind > 0 ) {
        if (rewind > files.length) {
          logger.warn("rewind value [" + rewind + "] is before the workflow started, assuming the oldest [" + files.length + "].");
          rewind = files.length;

        }
        index = files.length - rewind < files.length ? files.length - rewind : 0;
        current = files[index];
      }

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
    else {
      logger.error("✘ Unable to find workflow [" + id + "] " + err);
    }

  });


}

function initStore(config, callback){

  if(!initialised) {
    var stat;

    try {
      logger.debug("checking for data directory [" + config.dataDirectory + "]");
      stat = fs.statSync(config.dataDirectory);
      initialised = true;
    }
    catch(err) {
      try {
        logger.debug("creating data directory [" + config.dataDirectory + "]");
        fs.mkdirSync(config.dataDirectory);
        initialised = true;
      }
      catch(error) {
        logger.error("✘ Fatal Error, unable to find or create the data directory. " + error);
        callback(error);
        return;
      }
    }
  }
  callback(null);
}

function saveInstance(workflow, config, callback) {
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
