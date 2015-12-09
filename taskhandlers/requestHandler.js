var request = require('request');

/* Request Handler
 * A processus wrapper for the amazing module request.
 * See https://github.com/request/request#requestoptions-callback for parameters.options
 * Task INPUT
 * @param task.parameters.options The options object used by the request module
 * Task OUTPUT
 * @param task.parameters.response The response object returned from the request
 * @param task.parameters.body The body object returned from the request
 *
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.parameters) {
    callback(new Error("Task [" + taskName + "] has no parameters property!"), task);
    return;
  }

  request(task.parameters.options, function (error, response, body) {

    task.parameters.response = response;
    callback(error, task);

  });
};
