const path = require('path');

const run = function(cwd, pkg) {
  return Promise.resolve().then(function() {
    if (pkg.main) {
      try {
        require(path.resolve(process.cwd(), pkg.main));
        return Promise.resolve({result: 'pass'});
      } catch (e) {
        return Promise.resolve({result: 'fail', info: `\n${e}`});
      }
    }

    return Promise.resolve({result: 'skip', info: 'no main entry in package.json'});
  });
};

module.exports = run;
