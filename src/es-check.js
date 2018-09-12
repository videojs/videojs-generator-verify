const crypto = require('crypto');
const path = require('path');
const shell = require('shelljs');
const promiseSpawn = require('./promise-spawn.js');

/* run the es check tests */
const runEsCheck = function(cwd) {
  const text = 'Dist files have the correct js syntax';

  const esCheck = require.resolve('es-check');
  const randomString = crypto.randomBytes(20).toString('hex');
  const tempFile = path.join(shell.tempdir(), randomString) + '.js';
  const distDir = path.join(cwd, 'dist');

  if (!shell.test('-d', distDir) || !shell.ls(path.join(distDir, '*.es.js')).length) {
    return Promise.resolve({status: 1, text: `${text} error:\nno dist files`});
  }
  // we have to remove import/export from our es file
  // as its technically es6, due to import/export, but we transpile
  // it to es5 for easier usage, and we want to check
  // that everything other than import/export is es5.
  shell.cat('dist/*.es.js')
    .sed(/^import.*;/g, '')
    .sed(/^export .*;/g, '')
    .to(tempFile);

  const es5Patterns = [
    'dist/!(*.es.js|*.css)',
    tempFile
  ];

  // check for lang file dir, and that lang files exist
  if (shell.test('-d', path.join(cwd, 'dist', 'lang')) &&
      shell.ls(path.join(cwd, 'dist', 'lang', '*.js')).length) {
    es5Patterns.push('dist/lang/*.js');
  }

  return promiseSpawn(esCheck, ['es5', '--verbose', 'true'].concat(es5Patterns), {cwd}).then(function(result) {
    shell.rm('-f', tempFile);

    if (result.status === 0) {
      return Promise.resolve({status: 0, text});
    }

    return Promise.resolve({status: 1, text: `${text} error:\n${result.out.trim()}`});
  }).catch(function(e) {
    // remove tmp file
    shell.rm('-f', tempFile);
    return Promise.reject(e);
  });
};

module.exports = runEsCheck;
