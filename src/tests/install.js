const packInstall = require('../pack-install.js');

const run = function(tempdir, pkg, cache = {}) {
  const install = cache.packInstall = cache.packInstall || packInstall(tempdir);

  return install.then(function(cwd) {
    return Promise.resolve({result: 'pass'});
  }).catch(function(error) {
    return Promise.resolve({result: 'fail', info: `\n${error}`});
  });
};

module.exports = run;
