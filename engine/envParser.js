var expect = require('expect');
var _ = require('underscore');

module.exports = {
  parse: parse
};

function parse(rawWorkflow){
  //console.log(rawWorkflow);
  str = "" + rawWorkflow;

  //Look for all instances of '$env[<ENV_VAR>]'
  envs = str.match(/[$]env(\[(.*?)\])/g);

  if(envs) {
    //Cycle through fetching the env value and replacing
    for(var x=0; x<envs.length; x++){
      //Strip out '$env[<ENV_VAR>]'
      envKey = envs[x].substring(5, envs[x].length -1);
      //envKey = envs[x].match(/(\[(.*?)\])/g)[0];
      //remove []
      //envKey = envKey.substring(1, envKey.length -1);
      //get env var
      envValue = process.env[envKey];
      str = str.replace(envs[x], envValue);
    }
  }
  return str;
}
