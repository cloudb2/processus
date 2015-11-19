/*
 * store configuration
 */

exports.config = {
    "type": process.env.DB_TYPE, //store type, null for none.
    "dataDirectory": process.env.DATA_DIR
  };
