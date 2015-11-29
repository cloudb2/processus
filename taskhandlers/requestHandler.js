var request = require('request');

/* Request Handler
 * A processus wrapper for the amazing module request.
 * See https://github.com/request/request#requestoptions-callback for data.options
 * Task INPUT
 * @param task.data.options The options object used by the request module
 * Task OUTPUT
 * @param task.data.response The response object returned from the request
 * @param task.data.body The body object returned from the request
 *
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  var err;

  //Check for presence of the data property
  if(!task.data) {
    callback(new Error("Task [" + taskName + "] has no data property!"), task);
    return;
  }

  request(task.data.options, function (error, response, body) {

    task.data.response = response;
    task.data.body = body;
    callback(error, task);

  });
};
