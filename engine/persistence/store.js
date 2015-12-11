/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * store.js: persistence store entry point
 */

//declare required modules
var logger = require('../logger');
var config = require('./config').config;
var EventEmitter = require('events');

//declare module exports
module.exports = {
  deleteInstance: deleteInstance,
  loadDefinition: loadDefinition,
  loadInstance: loadInstance,
  initStore: initStore,
  saveInstance: saveInstance,
  deleteAll: deleteAll,
  exitStore: exitStore
};

function deleteAll(callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).deleteAll(config, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function deleteInstance(id, callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).deleteInstance(id, config, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function loadDefinition(id, callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).loadDefinition(id, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function loadInstance(id, rewind, callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).loadInstance(id, rewind, config, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function initStore(callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).initStore(config, callback);
  }
  else {
    callback(null);
  }
}

function saveInstance(workflow, callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).saveInstance(workflow, config, callback);
  }
  else {
    callback(null);
  }
}

function exitStore(callback) {
  logger.debug("Store is exiting...");
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).exitStore(config, callback);
  }
  else {
    callback(null);
  }
}
