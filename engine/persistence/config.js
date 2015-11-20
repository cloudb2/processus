/*
 * store configuration
 */

var type = process.env.DB_TYPE !== undefined ? process.env.DB_TYPE : "file";
var dataDirectory = process.env.DATA_DIR !== undefined ? process.env.DATA_DIR : "_data";
exports.config = {
    "type": type, //default "file"
    "dataDirectory": dataDirectory //default "_data"
  };
