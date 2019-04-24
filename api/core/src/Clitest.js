#!/usr/bin/env node
var program = require('commander');

function parseJson(val) {
  return JSON.parse(val);
}
console.log(process.argv);
program
  .command('call <method>')
  .option('-p, --params <params>', 'Set call parameters', parseJson)
  .option('-c, --context <context>', 'Set call context', parseJson)
  .action((method, options) => {
      console.log('tralalal', method, options);
  });

  program
  .command('setup [env]')
  .description('run setup commands for all envs')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function(env, options){
    var mode = options.setup_mode || "normal";
    env = env || 'all';
    console.log('setup for %s env(s) with %s mode', env, mode);
  });

program.parse(process.argv);