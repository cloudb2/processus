/*!
 * File based storage for Processus
 */
var logger = require('../logger');
var fs = require('fs');

module.exports = {
  save: save,
  init: init,
  load: load
};

function load(id, config, callback) {
  var current = config.dataDirectory + "/" + id;
  fs.readFile(current, function (err, data) {
    var workflowLoaded;
    if (err) {
      logger.error("Unable to find workflow [" + id + "] " + err);
    }
    else {
      workflowLoaded = JSON.parse(data);
    }
    callback(err, workflowLoaded);
  });
}

function init(config, callback){
  if (!fs.existsSync(config.dataDirectory)){
    fs.mkdir(config.dataDirectory, function(err){
      if(err) {
        logger.error("Error creating data directory: " + err);
      }
      else {
        logger.debug("created data directory " + config.dataDirectory);
      }
      callback(err);
    });
  }
  else {
    logger.debug("data directory " + config.dataDirectory + " already exists");
    callback(null);
  }
}

function save(workflow, config, callback) {
  var current = config.dataDirectory + "/" + workflow.id;
  //If the file already exists rename it based on current time
  if(fs.existsSync(current)) {
    fs.rename(current, current + "_" + Date.now(), function(err){
      if(err) {
        logger.error("Error renaming file: " + err);
      }
      else {
        writeCurrent(workflow, current, function(err){callback(err);});
      }
      callback(err);
    });
  }
  else {
    writeCurrent(workflow, current, function(err){callback(err);});
  }
}

function writeCurrent(workflow, current, callback) {
  //Save current workflow
  fs.writeFile(current, JSON.stringify(workflow, null, 2), function(err) {
      if(err) {
        logger.error("Error writing file: " + err);
      }
      else {
        logger.debug("saved workflow: " + current);
      }
      callback(err);
  });
}
