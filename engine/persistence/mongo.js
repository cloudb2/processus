/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * mongo.js: used to manage mongodb based persistence store
 */

//declare required modules
var logger = require('../logger');
var MongoClient = require('mongodb').MongoClient;

//declare module exports
module.exports = {
  deleteInstance: deleteInstance,
  loadDefinition: loadDefinition,
  saveDefinition: saveDefinition,
  getDefinition: getDefinition,
  loadInstance: loadInstance,
  initStore: initStore,
  saveInstance: saveInstance,
  deleteAll: deleteAll,
  exitStore: exitStore,
  deleteDefinition: deleteDefinition,
  getWorkflows: getWorkflows
};

//mongodb and collections, note we resuse these and rely on mongo's pooling
var mongodb;
var workflowInstances;
var workflowHistory;
var workflowDefinitions;


function initStore(config, callback){
  try {
    var url = "mongodb://" + config.host + ":" + config.port + "/processus";
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {

      if(!err){
        //store DB and collections for future use
        mongodb = db;
        workflowInstances = mongodb.collection('instances');
        workflowHistory = mongodb.collection('instances-history');
        workflowDefinitions = mongodb.collection('definitions');

        //Create index (if not already there) note: ensureIndex is deprecated
        db.createIndex('instances', {id:1}, {unique:true, background:true, w:1}, function(err, indexName) {
          if(!err) {
            db.createIndex('instances-history', {id:1}, {unique:true, background:true, w:1}, function(err, indexName) {
                if(!err) {
                  db.createIndex('definitions', {name:1}, {unique:true, background:true, w:1}, function(err, indexName){
                    //All done, passback last error (if any)
                    callback(err);
                  });
                }
                else {
                  //failed to create index instances-history
                  callback(err);
                }
            });
          }
          else {
            //failed to create index instances
            callback(err);
          }
        });
      }
      else {
        //Failed to connect, passback error
        callback(err);
      }
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}


function deleteAll(callback){
  try {
    //delete all instances and history
    deleteAllInstances(function(err){
      if(!err){
        deleteAllHistory(function(err){
          callback(err);
        });
      }
      else {
        callback(err);
      }
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function deleteAllInstances(callback){
  try {
    //delete all instances of the instances collection
    workflowInstances.deleteMany({}, function(err, result) {
      callback(err);
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function deleteAllHistory(callback){
  try {
    //delete all instances of the instances-history collection
    workflowHistory.deleteMany({}, function(err) {
      callback(err);
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function deleteInstanceHistory(id, callback){
  var query = {"id": new RegExp('^' + id + "_")};
  workflowHistory.deleteMany(query, function(err){
    callback(err);
  });
}

function deleteInstance(id, callback){
  try {
    workflowInstances.deleteOne({"id": id}, function(err) {
      if(!err){
        deleteInstanceHistory(id, function(err){
          callback(err);
        });
      }
      else {
        callback(err);
      }

    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function deleteDefinition(name, callback){
    try {
      workflowDefinitions.deleteOne({name: name}, function(err){
        callback(err);
      });
    }
    catch(mongoError){
      callback(mongoError);
    }
}

function loadDefinition(id, callback){
  try {
    //defer to file handler
    require("./file").loadDefinition(id, function(err, workflowDef){
      callback(err, workflowDef);
      /*
      if(!err){
        saveDefinition(workflowDef, function(err){
          callback(err, workflowDef);
        });
      }
      else {
        callback(err);
      }
      */
    });

  }
  catch(fileErr){
    callback(fileErr);
  }

}

function saveDefinition(workflowDef, callback){
  try {
    workflowDefinitions.update({name:workflowDef.name}, workflowDef, {upsert: true},function(err, r) {
       callback(err, r);
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function getDefinition(name, callback){
  try {
    workflowDefinitions.findOne({name:name}, function(err, r) {
      r._id = undefined;
      callback(err, r);
    });
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function getWorkflows(query, callback){
  try {
    workflowInstances.find(query).toArray().then(
      function(instances) {
        callback(null, instances);
      }
    );


  }
  catch(mongoError){
    callback(mongoError);
  }

}

function loadInstance(id, rewind, callback) {
  try {
    if(rewind === 0) {
      //rewind is current, so get the latest
      workflowInstances.findOne({"id": id}, function(err, result) {
       logger.debug("mongo found: " + result);
       callback(null, result);
      });
    }
    else {
      //Create regex starts with id_
      var query = {"id": new RegExp('^' + id + "_")};
      workflowHistory.find(query).toArray().then(
        function(history) {
         var index = history.length -1 - rewind;
         if(index < 0 )index = 0;
         //based on rewind value passback appropriate version of history
         callback(null, history[index]);
      });
    }
  }
  catch(mongoError){
    callback(mongoError);
  }
}


function saveInstance(workflow, callback) {
  try {
    //if there's no _id (as added by mongo), then insert a new one
    if(workflow._id === undefined){
      workflowInstances.insertOne(workflow, function(err, r) {
       logger.debug("mongo inserted: " + r);
       if(!err){
         var historyWorkflow = JSON.parse(JSON.stringify(workflow));
         historyWorkflow._id = undefined;
         historyWorkflow.id = workflow.id + "_" + Date.now();
         workflowHistory.insertOne(historyWorkflow, function(err, r) {
            callback(err);
         });
       }
       else {
         callback(err);
       }
      });
    }
    else {
      //reparse workflow object before updating, not doing this has caused
      //node to exist unexpectedly with Assertion failed: ((object->InternalFieldCount()) > (0))
      var updatedWorkflow = JSON.parse(JSON.stringify(workflow));
      updatedWorkflow._id = workflow._id;
      workflowInstances.updateOne({_id: workflow._id}, updatedWorkflow, function(err, r) {
        if(!err){
          //now record the history of this save point
          var historyWorkflow = JSON.parse(JSON.stringify(workflow));
          historyWorkflow._id = undefined;
          historyWorkflow.id = workflow.id + "_" + Date.now();
          workflowHistory.insertOne(historyWorkflow, function(err, r) {
             callback(err);
          });
        }
        else {
          callback(err);
        }
      });
    }
  }
  catch(mongoError){
    callback(mongoError);
  }
}

function exitStore(callback) {
  //if the db client is connected, try and close the DB (it's good housekeeping)
  //although node existiting will release the connection and DB.
  if(mongodb !== undefined && mongodb !== null){
    mongodb.close();
  }
  callback(null);
}
