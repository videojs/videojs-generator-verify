const path = require('path');
const promiseSpawn = require('../promise-spawn.js');
const fs = require('fs');
const packInstall = require('../pack-install');

const run = function(tempdir, pkg, cache = {}) {
  if (!pkg.main) {
    return Promise.resolve({result: 'skip', info: 'no main entry in package.json'});
  }
  const install = cache.packInstall = cache.packInstall || packInstall(tempdir);

  return install.then(function(cwd) {
    fs.writeFileSync(path.join(cwd, 'index.js'), `require("${pkg.name}");`);
    return promiseSpawn('node', ['index.js'], {cwd});
  }).then(function(result) {
    if (result.status === 0) {
      return Promise.resolve({result: 'pass'});
    }
    return Promise.resolve({result: 'fail', info: `\nError in ${pkg.main}:\n${result.out}`});
  }).catch(function(error) {
    return Promise.resolve({result: 'fail', info: error});
  });
};

module.exports = run;
