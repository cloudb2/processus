var cli = require('cli');
var fs = require('fs');
var processus = require('./processus');
var logger = require('./logger');

module.exports = function() {

  console.log(require('./title'));

  cli.parse({
      loglevel:   ['l', 'Set loglevel [debug|verbose|info|warn|error]', 'string', 'error'],
      file:  ['f', 'Workflow filename', 'file', 'workflow.json']
  });

  cli.main(function(args, options) {

    if (options.loglevel === 'debug' ||
        options.loglevel === 'verbose' ||
        options.loglevel === 'info' ||
        options.loglevel === 'warn' ||
        options.loglevel === 'error') {

        logger.level = options.loglevel;
    }
    else {
      logger.error("Invalid log level, see help for more info.");
      return;
    }

    var workflowFile;

    try {
      workflowFile = fs.readFileSync(options.file, "utf8");
    }
    catch(err) {
      logger.error("Failed to open JSON file " + options.file + "\n" + err.message);
      return;
    }

    var workflow;

    try {
      workflow = JSON.parse(workflowFile);
    }
    catch(err){
        logger.error("Failed to parse JSON file " + options.file + "\n" + err.message);
        return;
    }

    processus.execute(workflow, function(err, workflow){
      if(!err) {
        logger.info("Workflow returned successfully.");
        logger.debug(JSON.stringify(workflow, null, 2));
      }
      else {
        logger.error(err.message);
        logger.debug(JSON.stringify(workflow, null, 2));
      }
    });
  });
};
