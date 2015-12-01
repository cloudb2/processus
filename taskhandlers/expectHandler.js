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
 * @param task.parameters.expectations is an object consisting of expects. e.g.
     [expect name]{
       "assertion" [expect function]
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
     [expect name]{
       "assertion" [expect function]
       "object": [object to test],
       "value":  [value to expect],
       "message": [A message to return upon failure]
       "assertion": [true | false]
     }
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.parameters) {
    logger.debug("No task parameters property!");
    callback(new Error("Task [" + taskName + "] has no task parameters property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.parameters.expectations) {
    callback(new Error("Task [" + taskName + "] has no parameters.expectations property set!"), task);
    return;
  }

  //get the expect names
  var expectNames = Object.keys(task.parameters.expectations);

  for(var x=0; x<expectNames.length; x++){

    try {
      var expectName = expectNames[x];
      var expectDef = task.parameters.expectations[expectName];
      var assertion = expectDef.assertion;

      logger.debug("testing the assertions:  " + assertion);
      logger.debug("supplied expect object:  " + JSON.stringify(expectDef.object));
      logger.debug("supplied expect message: " + expectDef.message);
      logger.debug("supplied expect value:   " + JSON.stringify(expectDef.value));

      if(assertion === "toExist" ||
         assertion === "toNotExist") {
        expect(expectDef.object)[assertion](expectDef.message);
      }
      else if (assertion === "toBe" ||
               assertion === "toNotBe" ||
               assertion === "toEqual" ||
               assertion === "toNotEqual" ||
               assertion === "toBeA" ||
               assertion === "toNotBeA" ||
               assertion === "toMatch" ||
               assertion === "toBeLessThan" ||
               assertion === "toBeGreaterThan" ||
               assertion === "toInclude" ||
               assertion === "toExclude") {

        if(assertion === "toMatch"){
          //toMatch expects a regular expression, so convert string accordingly
          expectDef.value = new RegExp(expectDef.value);
        }
        expect(expectDef.object)[assertion](expectDef.value, expectDef.message);
      }
      else {
          callback(new Error("Unknown or unsupported expect function [" + assertion + "] in task [" + taskName + "]"), task);
          return;
      }
      task.parameters.expectations[expectName].result = true;
    }
    catch(expectError){
      if(task.ignoreError === true) {
        task.errorMsg = expectError.message;
        task.parameters.expectations[expectName].result = false;
      }
      else {
        callback(expectError, task);
        return;
      }
    }
  }
  callback(null, task);
};
