/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * logger.js: Processus logger (based on the wondeful winston)
 */

var logger = require('winston');
logger.setLevels({debug:0, verbose:1, info: 2,warn: 3,error:4,});
logger.addColors({debug: 'green', info: 'cyan',verbose: 'magenta',warn:  'yellow',error: 'red'});
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'debug', colorize:true });
logger.level = "error"; //default

module.exports = logger;
