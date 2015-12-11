/* Condition Handler
 * A very simple condition evaluation handler for non programmers
 * Task INPUT
 * @param task.parameters.conditions Condition objects consisting of
  "[condition name]"{
    "valueA":[ValueA],
    "operator":[operator],
    "valueB":[valueB]
  }
 * where [operator] must be one of the following:
 * "IS", "EQUALS", "=", "MATCH"
 * "IS NOT", "NOT EQUALS", "!=", "NOT MATCH",
 * "GREATER THAN", ">",
 * "LESS THAN", "<",
 * "GREATER OR EQUALS", ">=",
 * "LESS OR EQUALS", "<="
 * (note case is ignored)
 * Task OUTPUT
 * @param task.parameters.conditions each condition is updated to include a result e.g.
 "[condition name]"{
   "valueA":[ValueA],
   "operator":[operator],
   "valueB":[valueB],
   "valid": [true if condition is valid],
   "invalid": [true if condition is invalid]
 }
 * @param task.parameters.anyValid true if ANY condition evaluates to true
 * @param task.parameters.allValid true if ALL conditions evaluate to true
 * @param task.parameters.notAnyValid convenience property to show !anyValid
 * @param task.parameters.notAllValid convenience property to show !allValid
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.parameters) {
    logger.debug("No task data property!");
    callback(new Error("Task [" + taskName + "] has no parameters property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.parameters.conditions) {
    callback(new Error("Task [" + taskName + "] has no parameters.conditions property set!"), task);
    return;
  }

  //get the conditions
  conditionNames = Object.keys(task.parameters.conditions);

  task.parameters.andResult = false;
  task.parameters.orResult = false;

  if(conditionNames.length > 0) { task.parameters.andResult = true; }

  for(var x=0; x<conditionNames.length; x++) {
    var condition = conditionNames[x];

    //break out the condition
    var valA = task.parameters.conditions[condition].valueA;
    var valB = task.parameters.conditions[condition].valueB;
    var op = task.parameters.conditions[condition].operator;

    if(valA === undefined) {
      callback(new Error("Task [" + taskName + "] condition [" + condition + "] has no valueA property set!"), task);
      return;
    }
    if(valB === undefined) {
      callback(new Error("Task [" + taskName + "] condition [" + condition + "] has no valueB property set!"), task);
      return;
    }
    if(op === undefined) {
      callback(new Error("Task [" + taskName + "] condition [" + condition + "] has no operator property set!"), task);
      return;
    }

    //Check if value is Not a number, if so JSON.Stringify it to make a "simple" object comparison
    //dangerous in code, but ok for JSON workflows in processus
    if(isNaN(valA)){ valA = JSON.stringify(valA); }
    if(isNaN(valB)){ valB = JSON.stringify(valB); }

    //update result based on operator
    if(op.toLowerCase() === "is" ||
       op.toLowerCase() === "equals" ||
       op.toLowerCase() === "=" ||
       op.toLowerCase() === "match") {
      logger.debug("testing condition is " + valA + " is " + valB + " = " + (valA === valB));
      task.parameters.conditions[condition].valid = (valA === valB);
    }
    else if(op.toLowerCase() === "is not" ||
       op.toLowerCase() === "not equals" ||
       op.toLowerCase() === "!="||
       op.toLowerCase() === "not match") {
      task.parameters.conditions[condition].valid = (valA !== valB);
    }
    else if(op.toLowerCase() === "greater than" ||
       op.toLowerCase() === "greater" ||
       op.toLowerCase() === ">") {
      task.parameters.conditions[condition].valid = (valA > valB);
    }
    else if(op.toLowerCase() === "less than" ||
       op.toLowerCase() === "less" ||
       op.toLowerCase() === "<") {
      task.parameters.conditions[condition].valid = (valA < valB);
    }
    else if(op.toLowerCase() === "greater or equals" ||
       op.toLowerCase() === ">=") {
      task.parameters.conditions[condition].valid = (valA >= valB);
    }
    else if(op.toLowerCase() === "less or equals" ||
       op.toLowerCase() === "<=") {
      task.parameters.conditions[condition].valid = (valA <= valB);
    }
    else {
      callback(new Error("Unknown conditional operator [" + op + "] in task [" + taskName + "]"), task);
      return;
    }

    task.parameters.conditions[condition].invalid = !task.parameters.conditions[condition].valid;

    //update orResult and andResult
    if(task.parameters.conditions[condition].valid === true) {
      //at least 1 or more condition is true so set orResult accordingly
      task.parameters.anyValid = true;
    }

    if(task.parameters.allValid === true && task.parameters.conditions[condition].valid === true){
      task.parameters.allValid = true;
    }
    else {
      task.parameters.allValid = false;
    }
  }

  task.parameters.notAllValid = !task.parameters.allValid;
  task.parameters.notAnyValid = !task.parameters.anyValid;

  callback(null, task);

};
