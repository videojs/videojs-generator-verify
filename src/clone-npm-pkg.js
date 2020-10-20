const path = require('path');
const crypto = require('crypto');
const shell = require('shelljs');
const promiseSpawn = require('./promise-spawn.js');
const exitHook = require('exit-hook');

const run = function(origdir) {
  const tempdir = path.join(shell.tempdir(), crypto.randomBytes(20).toString('hex'));

  exitHook(() => shell.rm('-rf', tempdir));

  shell.mkdir('-p', tempdir);

  return promiseSpawn('npm', ['pack', '--json', '--dry-run'], {cwd: origdir}).then(function(result) {
    if (result.status !== 0) {
      return Promise.resolve({result: 'fail', info: `\n${result.out}`});
    }
    const packOutput = JSON.parse(result.stdout);

    return Promise.all(packOutput.map((output) => {
      return Promise.all(output.files.map((file) => Promise.resolve().then(function() {
        const dirname = path.dirname(file.path);

        if (dirname) {
          shell.mkdir('-p', path.join(tempdir, dirname));
        }

        shell.cp(path.join(origdir, file.path), path.join(tempdir, file.path));
      })));
    })).then(() => {
      return Promise.resolve({result: 'pass', tempdir});
    });
  });
};

module.exports = run;
