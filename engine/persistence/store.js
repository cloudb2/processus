/*!
 * Processus Persistence Store
 */
var logger = require('../logger');
var config = require('./config').config;

module.exports = {
  save: save,
  init: init,
  load: load
};

function load(id, callback) {
  if(config.type !== null) {
    require('./' + config.type).load(id, config, callback);
  }
  else {
    callback(new Error("Unable to load workflow, no store type selected."));
  }
}

function init(callback) {
  if(config.type !== null) {
    require('./' + config.type).init(config, callback);
  }
  else {
    callback(null);
  }
}

function save(workflow, callback) {
  if(config.type !== null) {
    require('./' + config.type).save(workflow, config, callback);
  }
  else {
    callback(null);
  }
}
