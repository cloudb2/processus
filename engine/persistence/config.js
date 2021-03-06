/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * config.js: used to configure the persistence store
 */

//Fetch and set default env vars
var type = process.env.DB_TYPE !== undefined ? process.env.DB_TYPE : "file";
var dataDirectory = process.env.DB_DIR !== undefined ? process.env.DB_DIR : "_data";
var dataHost = process.env.DB_HOST !== undefined ? process.env.DB_HOST : "localhost";
var dataPort = process.env.DB_PORT !== undefined ? process.env.DB_PORT : 0;

//declare module exports
exports.config = {
  "type": type, //default "file"
  "dataDirectory": dataDirectory, //default "_data",
  "host": dataHost,
  "port": dataPort
};
