/* Condition Handler
 * A very simple condition evaluation handler for non programmers
 * Task INPUT
 * @param task.data.conditions Condition objects consisting of
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
 * @param task.data.conditions each condition is updated to include a result e.g.
 "[condition name]"{
   "valueA":[ValueA],
   "operator":[operator],
   "valueB":[valueB],
   "valid": [true if condition is valid],
   "invalid": [true if condition is invalid]
 }
 * @param task.data.anyValid true if ANY condition evaluates to true
 * @param task.data.allValid true if ALL conditions evaluate to true
 * @param task.data.notAnyValid convenience property to show !anyValid
 * @param task.data.notAllValid convenience property to show !allValid
 */
module.exports = function(workflowId, taskName, task, callback, logger){

  //validate that task data element exists
  if(!task.data) {
    logger.debug("No task data property!");
    callback(new Error("Task [" + taskName + "] has no data property!"), task);
    return;
  }

  //Validate that the data cmd property has been set
  if(!task.data.conditions) {
    callback(new Error("Task [" + taskName + "] has no data.conditions property set!"), task);
    return;
  }

  //get the conditions
  conditionNames = Object.keys(task.data.conditions);

  task.data.andResult = false;
  task.data.orResult = false;

  if(conditionNames.length > 0) { task.data.andResult = true; }

  for(var x=0; x<conditionNames.length; x++) {
    var condition = conditionNames[x];

    //break out the condition
    var valA = task.data.conditions[condition].valueA;
    var valB = task.data.conditions[condition].valueB;
    var op = task.data.conditions[condition].operator;

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
      task.data.conditions[condition].valid = (valA === valB);
    }
    else if(op.toLowerCase() === "is not" ||
       op.toLowerCase() === "not equals" ||
       op.toLowerCase() === "!="||
       op.toLowerCase() === "not match") {
      task.data.conditions[condition].valid = (valA !== valB);
    }
    else if(op.toLowerCase() === "greater than" ||
       op.toLowerCase() === "greater" ||
       op.toLowerCase() === ">") {
      task.data.conditions[condition].valid = (valA > valB);
    }
    else if(op.toLowerCase() === "less than" ||
       op.toLowerCase() === "less" ||
       op.toLowerCase() === "<") {
      task.data.conditions[condition].valid = (valA < valB);
    }
    else if(op.toLowerCase() === "greater or equals" ||
       op.toLowerCase() === ">=") {
      task.data.conditions[condition].valid = (valA >= valB);
    }
    else if(op.toLowerCase() === "less or equals" ||
       op.toLowerCase() === "<=") {
      task.data.conditions[condition].valid = (valA <= valB);
    }
    else {
      callback(new Error("Unknown conditional operator [" + op + "] in task [" + taskName + "]"), task);
      return;
    }

    task.data.conditions[condition].invalid = !task.data.conditions[condition].valid;

    //update orResult and andResult
    if(task.data.conditions[condition].valid === true) {
      //at least 1 or more condition is true so set orResult accordingly
      task.data.anyValid = true;
    }

    if(task.data.allValid === true && task.data.conditions[condition].valid === true){
      task.data.allValid = true;
    }
    else {
      task.data.allValid = false;
    }
  }

  task.data.notAllValid = !task.data.allValid;
  task.data.notAnyValid = !task.data.anyValid;

  //logger.info("✔ task [" + taskName + "] completed successfully.");
  callback(null, task);

};
