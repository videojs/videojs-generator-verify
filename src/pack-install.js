const path = require('path');
const crypto = require('crypto');
const promiseSpawn = require('./promise-spawn.js');
const exitHook = require('exit-hook');
const shell = require('shelljs');
const fs = require('fs');
const {getParsedJsonFromOutput} = require('./utils');

const packInstall = function(pkgdir) {
  return Promise.resolve().then(function() {
    const cwd = path.join(shell.tempdir(), crypto.randomBytes(20).toString('hex'));

    exitHook(() => shell.rm('-rf', cwd));
    fs.mkdirSync(cwd);

    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({
      name: 'packed-install',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: [],
      author: '',
      license: 'ISC',
      dependencies: require(`${pkgdir}/package.json`).peerDependencies || {}
    }));
    return promiseSpawn('npm', ['i', '--prefer-offline', '--json'], {cwd}).then(function(output) {
      if (output.status !== 0) {
        return Promise.reject(`npm install failed:\n${output.out}`);
      }
      return promiseSpawn('npm', ['pack', pkgdir, '--json'], {cwd}).then(function(pack) {
        if (pack.status !== 0) {
          return Promise.reject(`npm pack failed:\n${pack.out}`);
        }

        let tarball = getParsedJsonFromOutput(pack.stdout)[0].filename;

        if (tarball.startsWith('@')) {
          // This is a scoped package. Workaround for npm issue: https://github.com/npm/cli/pull/5894
          tarball = tarball
            .replace('@', '')
            .replace('/', '-');
        }

        return promiseSpawn('npm', [
          'i',
          '--prefer-offline',
          '--production',
          '--no-audit',
          '--progress=false',
          path.join(cwd, tarball)
        ], {cwd}).then(function(install) {
          if (install.status !== 0) {
            return Promise.reject(`npm install failed on packed tarball:\n${install.out}`);
          }
          shell.rm('-f', tarball);

          return Promise.resolve(cwd);
        });
      });
    });
  });
};

module.exports = packInstall;
