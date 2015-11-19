/*!
 * Set the winston logger transorts and formatting and export to the caller
 */

var logger = require('winston');
logger.setLevels({debug:0, verbose:1, info: 2,warn: 3,error:4,});
logger.addColors({debug: 'green', info: 'cyan',verbose: 'magenta',warn:  'yellow',error: 'red'});
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'debug', colorize:true });
module.exports = logger;
