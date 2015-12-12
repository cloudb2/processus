/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * logger.js: Processus logger (based on the wonderful winston)
 */

var logger = require('winston');

logger.setLevels({error: 4,
                  warn: 3,
                  info: 2,
                  verbose: 1,
                  debug: 0});
logger.addColors({error: 'red',
                  warn: 'yellow',
                  info: 'cyan',
                  verbose: 'magenta',
                  debug: 'green'});

logger.remove(logger.transports.Console);

logger.add(logger.transports.Console, { level: 'info',
                                        colorize:true,
                                        stderrLevels:['error'] });

logger.level = "info"; //default

module.exports = logger;
