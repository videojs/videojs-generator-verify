#! /usr/bin/env node
/* eslint-disable no-console */

const verify = require('./index.js');
const pkg = require('../package.json');
const testNames = Object.keys(require('./tests.js'));

const printHelp = function(console) {
  console.log();
  console.log('  Usage: vjsverify [--verbose|--quiet|--skip-es-check]');
  console.log();
  console.log(`  ${pkg.description}`);
  console.log();
  console.log('  -v, --version       Print the version of videojs-generator-verify.');
  console.log('  -V, --verbose       Print all results, even successful ones.');
  console.log('  -q, --quiet         Don\'t print anything.');
  console.log('  -d, --dir [dir]     Run in this project directory, defaults to cwd.');
  console.log('  --skip-es-check     skip the syntax check, still here for backwards compatablity');
  console.log(`  --skip-[name]       skip a test that you do not want to run. ${testNames.join(', ')}`);
  console.log();
};

const cli = function(args, console, exit) {
  const options = {
    verbose: false,
    quiet: false,
    dir: process.cwd()
  };

  // only takes one argument
  for (let i = 0; i < args.length; i++) {
    if ((/^-h|--help$/).test(args[i])) {
      printHelp(console);
      return exit();
    } else if ((/^-v|--version$/).test(args[i])) {
      console.log(pkg.version);
      return exit();
    } else if ((/^-V|--verbose$/).test(args[i])) {
      options.verbose = true;
    } else if ((/^-q|--quiet$/).test(args[i])) {
      options.quiet = true;
    } else if ((/^--skip-es-check$/).test(args[i])) {
      options.skip = options.skip || [];
      options.skip.push('syntax');
    } else if ((/^--skip-/).test(args[i])) {
      const testName = args[i].replace('--skip-', '');

      if (testNames.indexOf(testName) === -1) {
        console.error(`${testName} is not a valid test to skip!`);
        return exit(1);
      }

      options.skip = options.skip || [];
      options.skip.push(testName);
    } else if ((/^-d|--dir$/).test(args[i])) {
      i++;
      options.dir = args[i];
    }
  }

  return options;
};

module.exports = {cli, printHelp};

// The code below will only run when working as an executable
// that way we can test the cli using require in unit tests.
if (require.main === module) {
  const options = cli(process.argv.slice(2), console, process.exit);

  verify(options).then(function(exitCode) {
    process.exit(exitCode);
  });
}
