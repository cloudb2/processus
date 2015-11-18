var request = require('request');

/* Request Handler
 * A processus wrapper for the amazing module request
 * See https://github.com/request/request#requestoptions-callback for data.options
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
