#! /usr/bin/env node
/* eslint-disable no-console */

const verify = require('./index.js');
const pkg = require('../package.json');
const testNames = Object.keys(require('./tests.js'));

const options = {
  verbose: false,
  quiet: false,
  dir: process.cwd()
};

const printHelp = function() {
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

// only takes one argument
for (let i = 0; i < process.argv.length; i++) {
  if ((/^-h|--help$/).test(process.argv[i])) {
    printHelp();
    process.exit();
  } else if ((/^-v|--version$/).test(process.argv[i])) {
    console.log(pkg.version);
    process.exit();
  } else if ((/^-V|--verbose$/).test(process.argv[i])) {
    options.verbose = true;
  } else if ((/^-q|--quiet$/).test(process.argv[i])) {
    options.quiet = true;
  } else if ((/^--skip-es-check$/).test(process.argv[i])) {
    options.skip = options.skip || [];
    options.skip.push('syntax');
  } else if ((/^--skip-/).test(process.argv[i])) {
    const testName = process.argv[i].replace('--skip-', '');

    if (testNames.indexOf(testName) === -1) {
      console.error(`${testName} is not a valid test to skip!`);
      process.exit(1);
    }

    options.skip = options.skip || [];
    options.skip.push(testName);
  } else if ((/^-d|--dir$/).test(process.argv[i])) {
    i++;
    options.dir = process.argv[i];
  }
}

verify(options).then(function(exitCode) {
  process.exit(exitCode);
});
