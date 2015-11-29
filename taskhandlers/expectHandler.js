var expect = require('expect');

/* Expect Handler
 * A wraper for node expect module
 * see https://github.com/mjackson/expect for usage
 * supported expect functions are:
 * toExist
 * toNotExist
 * toBe
 * toNotBe
 * toEqual
 * toNotEqual
 * toBeA
 * toNotBeA
 * toMatch
 * toBeLessThan
 * toBeGreaterThan
 * toInclude
 * toExclude
 *
 * Task INPUT
 * @param task.data.expectations is an object consisting of expects. e.g.
     [expect function]{
       "object": [object to test],
       "value":  [value to expect],
       "message": [A message to return upon failure]
     }
 * Task OUTPUT
 * if task.ignoreError = false
 *    Each expect object is furnished with an assertion true or an error
 * if task.ignoreError = true
 *    Each expect object is furnished with an assertion true or false (errors are suppressed)
 *
     [expect function]{
       "object": [object to test],
       "value":  [value to expect],
       "message": [A message to return upon failure]
       "assertion": [true | false]
     }
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.data) {
    logger.debug("No task data property!");
    callback(new Error("Task [" + taskName + "] has no task data property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.data.expectations) {
    callback(new Error("Task [" + taskName + "] has no data.expectations property set!"), task);
    return;
  }

  //get the expect names
  var expectNames = Object.keys(task.data.expectations);

  for(var x=0; x<expectNames.length; x++){

    try {
      var expectName = expectNames[x];
      var expectDef = task.data.expectations[expectName];

      logger.debug("testing the assertions:  " + expectName);
      logger.debug("supplied expect object:  " + JSON.stringify(expectDef.object));
      logger.debug("supplied expect message: " + expectDef.message);
      logger.debug("supplied expect value:   " + JSON.stringify(expectDef.value));

      if(expectName === "toExist" ||
         expectName === "toNotExist") {
        expect(expectDef.object)[expectName](expectDef.message);
      }
      else if (expectName === "toBe" ||
               expectName === "toNotBe" ||
               expectName === "toEqual" ||
               expectName === "toNotEqual" ||
               expectName === "toBeA" ||
               expectName === "toNotBeA" ||
               expectName === "toMatch" ||
               expectName === "toBeLessThan" ||
               expectName === "toBeGreaterThan" ||
               expectName === "toInclude" ||
               expectName === "toExclude") {

        if(expectName === "toMatch"){
          //toMatch expects a regular expression, so convert string accordingly
          expectDef.value = new RegExp(expectDef.value);
        }
        expect(expectDef.object)[expectName](expectDef.value, expectDef.message);
      }
      else {
          callback(new Error("Unknown or unsupported expect function [" + expectName + "] in task [" + taskName + "]"), task);
          return;
      }
      task.data.expectations[expectName].assertion = true;
    }
    catch(expectError){
      if(task.ignoreError === false) {
        callback(expectError, task);
        return;
      }
      else {
        task.errorMsg = expectError.message;
        task.data.expectations[expectName].assertion = false;
      }
    }
  }
  callback(null, task);
};
