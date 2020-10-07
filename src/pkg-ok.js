const pkgOk = require('pkg-ok');

const run = function(cwd) {
  return new Promise(function(resolve, reject) {
    try {
      pkgOk(cwd);
      resolve({result: 'pass'});
    } catch (e) {
      resolve({result: 'fail', info: e});
    }
  });
};

module.exports = run;
