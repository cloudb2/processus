/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * store.js: persistence store entry point
 */

//declare required modules
var logger = require('../logger');
var config = require('./config').config;
var EventEmitter = require('events');
var deasync = require('deasync');

//declare module exports
module.exports = {
  deleteInstance: deleteInstance,
  loadDefinition: loadDefinition,
  loadInstance: loadInstance,
  initStore: initStore,
  saveInstance: saveInstance,
  deleteAll: deleteAll,
  exitStore: exitStore,
  saveDefinition: saveDefinition,
  getDefinition: getDefinition,
  getWorkflows: getWorkflows,
  deleteDefinition: deleteDefinition
};

function deleteAll(callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).deleteAll(callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function deleteInstance(id, callback) {
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).deleteInstance(id, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function getDefinition(name, callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).getDefinition(name, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function saveDefinition(workflowDef, callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).saveDefinition(workflowDef, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function deleteDefinition(name, callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).deleteDefinition(name, callback);
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
  logger.debug("loading instance called with " + id + ", " + rewind);
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).loadInstance(id, rewind, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function getWorkflows(query, callback){
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).getWorkflows(query, callback);
  }
  else {
    callback(new Error("Persistence store error, no store type selected."));
  }
}

function initStore(callback) {
  try {
    if(config.type !== null && config.type !== undefined) {
      require('./' + config.type).initStore(config, callback);
    }
    else {
      callback(null);
    }
  }
  catch(storeErr){
    callback(storeErr);
  }
}

function saveInstance(workflow, callback) {
  try {
    if(config.type !== null && config.type !== undefined) {
      require('./' + config.type).saveInstance(workflow, function(err){
        callback(err);
      });
    }
    else {
      callback(null);
    }
  }
  catch(storeErr){
    callback(storeErr);
  }

}

function exitStore(callback) {
  logger.debug("Store is exiting...");
  if(config.type !== null && config.type !== undefined) {
    require('./' + config.type).exitStore(callback);
  }
  else {
    callback(null);
  }
}
