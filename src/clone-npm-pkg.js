const path = require('path');
const os = require('os');
const crypto = require('crypto');
const shell = require('shelljs');
const promiseSpawn = require('./promise-spawn.js');
const exitHook = require('exit-hook');

const run = function(cwd) {
  const WORKING_DIR = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));

  exitHook(() => shell.rm('-rf', WORKING_DIR));

  shell.mkdir('-p', WORKING_DIR);

  return promiseSpawn('npm', ['pack', '--json', '--dry-run'], {cwd}).then(function(result) {
    if (result.status !== 0) {
      return Promise.resolve({result: 'fail', info: `\n${result.out}`});
    }
    const packOutput = JSON.parse(result.stdout);

    return Promise.all(packOutput.map((output) => {
      return Promise.all(output.files.map((file) => Promise.resolve().then(function() {
        const dirname = path.dirname(file.path);

        if (dirname) {
          shell.mkdir('-p', path.join(WORKING_DIR, dirname));
        }

        shell.cp(file.path, path.join(WORKING_DIR, file.path));
      })));
    })).then(() => {
      return Promise.resolve({result: 'pass', dir: WORKING_DIR});
    });
  });
};

module.exports = run;
