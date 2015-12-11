/*
 * Processus, by cloudb2, MPL2.0 (See LICENSE file in root dir)
 *
 * envParser.js: parse workflow for env vars
 */

var expect = require('expect');
var _ = require('underscore');

module.exports = {
  parse: parse
};

function parse(rawWorkflow){
  str = "" + rawWorkflow;

  //Look for all instances of '$env[<ENV_VAR>]'
  envs = str.match(/[$]env(\[(.*?)\])/g);

  if(envs) {
    //Cycle through fetching the env value and replacing
    for(var x=0; x<envs.length; x++){
      //Strip out '$env[<ENV_VAR>]'
      envKey = envs[x].substring(5, envs[x].length -1);
      envValue = process.env[envKey];
      str = str.replace(envs[x], envValue);
    }
  }
  return str;
}
