var expect = require('expect');

/* Expect Handler
 * A wraper for node expect module
 * see https://github.com/mjackson/expect for usage
 * supported expect names are:
 * toExist
   toNotExist
   toBe
   toNotBe
   toEqual
   toNotEqual
   toBeA
   toNotBeA
   toMatch
   toBeLessThan
   toBeGreaterThan
   toInclude
   toExclude
 *
 * INPUT
 * @param task.data.expectations is an object consisting of expects. e.g.
     [expect name]{
       "object": [object to test],
       "value":  [value to expect],
       "message": [A message to return upon failure]
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

      logger.info("expect name " + expectName);
      logger.info("expectDef object" + expectDef.object);
      logger.info("expectDef message" + expectDef.message);


      if(expectName === "toExist" ||
         expectName === "toNotExist") {

        logger.info("executing");
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
          expectDef.value = new RegExp(expectDef.value);
        }
        expect(expectDef.object)[expectName](expectDef.value, expectDef.message);

      }
      else {
        callback(new Error("Unknown or unsupported expectation [" + expectName + "] in task [" + taskName + "]"), task);
        return;

      }

    }
    catch(expectError){
      callback(expectError, task);
      return;
    }

  }

  callback(null, task);

};
