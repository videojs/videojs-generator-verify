const path = require('path');
const crypto = require('crypto');
const os = require('os');
const promiseSpawn = require('./promise-spawn.js');
const exitHook = require('exit-hook');
const shell = require('shelljs');
const fs = require('fs');

const run = function(tempdir, pkg, origdir) {
  if (!pkg.main) {
    return Promise.resolve({result: 'skip', info: 'no main entry in package.json'});
  }
  const cwd = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));

  return Promise.resolve().then(function() {
    exitHook(() => shell.rm('-rf', cwd));
    shell.mkdir('-p', cwd);
    return promiseSpawn('npm', ['init', '-y'], {cwd});
  }).then(function(result) {
    fs.writeFileSync(path.join(cwd, 'index.js'), `require("${pkg.name}");`);
    return promiseSpawn('npm', [
      'i',
      '--prefer-online',
      '--production',
      '--no-audit',
      '--progress=false',
      tempdir
    ], {cwd});
  }).then(function(result) {
    return promiseSpawn('node', ['index.js'], {cwd});
  }).then(function(result) {
    if (result.status === 0) {
      return Promise.resolve({result: 'pass'});
    }
    return Promise.resolve({result: 'fail', info: `\nError in ${pkg.main}:\n${result.out}`});
  });
};

module.exports = run;
