const crypto = require('crypto');
const path = require('path');
const shell = require('shelljs');
const promiseSpawn = require('../promise-spawn.js');
const esCheck = require.resolve('es-check');
const exitHook = require('exit-hook');
const fs = require('fs');
const {cjsFields, esFields, getFieldFiles} = require('../pkg-field-helpers.js');

const gatherFiles = function(cwd) {
  const distDir = path.join(cwd, 'dist');

  return Promise.resolve().then(function() {
    shell.config.silent = true;
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
    const files = new Set();

    // pkg.json cjs files
    getFieldFiles(pkg, cjsFields).forEach((file) => {
      const filepath = path.join(cwd, file);

      if (shell.test('-f', filepath)) {
        files.add(filepath);
      }
    });

    // lang
    shell.ls(path.join(distDir, 'lang', '*.js')).forEach(files.add, files);
    // cjs library files
    shell.ls(path.join(cwd, 'cjs', '**', '*.js')).forEach(files.add, files);
    // cjs/browser rollup files
    shell.ls(path.join(distDir, '*.js'))
      .filter((f) => !(/.es.js$/).test(f))
      .forEach(files.add, files);

    const esFiles = new Set();

    // pkg.json es files
    getFieldFiles(pkg, esFields).forEach((file) => {
      const filepath = path.join(cwd, file);

      if (shell.test('-f', filepath)) {
        esFiles.add(filepath);
      }
    });

    const skipFiles = new Set();

    // skip es library files
    shell.ls(path.join(cwd, 'es', '**', '*.js')).forEach(skipFiles.add, skipFiles);

    // es rollup files
    shell.ls(path.join(distDir, '*.es.js')).forEach(esFiles.add, esFiles);

    const promises = [];
    const randomString = crypto.randomBytes(20).toString('hex');
    const tempdir = path.join(shell.tempdir(), randomString);

    shell.mkdir('-p', tempdir);

    exitHook(() => shell.rm('-rf', tempdir));

    esFiles.forEach(function(file) {
      if (skipFiles.has(file)) {
        return;
      }
      const promise = Promise.resolve().then(function() {
        const destFile = path.join(tempdir, path.relative(cwd, file));

        shell.mkdir('-p', path.dirname(destFile));

        // we have to remove import/export from our es file
        // as its technically es6, due to import/export, but we transpile
        // it to es5 for easier usage, and we want to check
        // that everything other than import/export is es5.
        shell.cat(file)
          .sed(/^import.*;/g, '')
          .sed(/^export .*;/g, '')
          .to(destFile);

        files.add(destFile);
        return Promise.resolve();
      });

      promises.push(promise);
    });

    return Promise.all(promises).then(function() {
      const arr = [];

      files.forEach((f) => arr.push(f));

      return Promise.resolve(arr);
    });
  });
};
const runEsCheck = function(tempdir, pkg, cache) {
  return gatherFiles(tempdir).then(function(files) {
    if (!files.length) {
      return Promise.resolve({result: 'skip', info: 'did not find any files to check'});
    }

    const args = ['es5', '--verbose', '--allow-hash-bang'].concat(files);

    return promiseSpawn(esCheck, args, {cwd: tempdir}).then(function(result) {
      if (result.status === 0) {
        return Promise.resolve({result: 'pass'});
      }

      return Promise.resolve({result: 'fail', info: `\n${result.out}`.split(tempdir).join('')});
    });
  });
};

module.exports = runEsCheck;
