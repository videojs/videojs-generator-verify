/* eslint-disable no-console */
const path = require('path');
const colorette = require('colorette');
const fs = require('fs');
const clonePkg = require('./clone-npm-pkg.js');
const tests = require('./tests');

const CHECK_MARK = colorette.green('✔');
const CROSS_MARK = colorette.red('✘');
const SKIP_MARK = colorette.yellow('→');

const generateSkip = (info) => Promise.resolve({result: 'skip', info});
const generateFail = (info) => Promise.resolve({result: 'fail', info});

const verify = function(options) {
  const log = (...args) => options.verbose && !options.quiet && console.log.apply(null, args);
  const error = (...args) => !options.quiet && console.error.apply(null, args);

  if (!options.dir || !fs.existsSync(options.dir) || !fs.existsSync(path.join(options.dir, 'package.json'))) {
    error('You must pass/run in/with a directory that exists with a package.json');
    return Promise.resolve(1);
  }

  const logResult = (promise, name, text) => promise.then((retval) => {
    // default to failure
    let symbol = CROSS_MARK;
    let logFn = error;
    const {result, info} = retval;

    if (result === 'pass') {
      symbol = CHECK_MARK;
      logFn = log;
    } else if (result === 'skip') {
      symbol = SKIP_MARK;
      logFn = log;
    }

    logFn(`${symbol} ${name}: ${text} ${info || ''}`);

    return Promise.resolve(retval);
  });

  const pkg = JSON.parse(fs.readFileSync(path.join(options.dir, 'package.json')));
  const cache = {};

  return logResult(clonePkg(options.dir, pkg, cache), 'package', 'npm pack on publish will succeed').then(function({result, tempdir}) {
    const promises = Object.keys(tests).map(function(key) {
      let {text, fn} = tests[key];

      // without a working cloned directory everything fails
      if (result !== 'pass') {
        fn = () => generateFail('npm pack failed');
      }

      if (options.skip && options.skip.indexOf(key) !== -1) {
        fn = () => generateSkip('skipped by options');
      }

      return logResult(fn(tempdir, pkg, cache), key, text);
    });

    return Promise.all(promises);
  }).then(function(results) {
    return Promise.resolve(!results.some((r) => r.result === 'fail') ? 0 : 1);
  }).catch(function(e) {
    error('vjsverify: An internal error occurred', e.stack);
    return Promise.resolve(1);
  });
};

module.exports = verify;
