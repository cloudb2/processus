/*!
 * Set the winston logger transorts and formatting and export to the caller
 */
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
        return new Date().toISOString().
          replace(/T/, ' ').      // replace T with a space
          replace(/\..+/, '');
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

module.exports = logger;
