const pkgCanInstall = require.resolve('pkg-can-install');
const promiseSpawn = require('./promise-spawn.js');

const run = function(cwd) {
  return promiseSpawn(pkgCanInstall, [], {cwd}).then((result) => {
    if (result.status !== 0) {
      return Promise.resolve({result: 'fail', info: `\n${result.out}`});
    }
    return Promise.resolve({result: 'pass'});
  });
};

module.exports = run;
