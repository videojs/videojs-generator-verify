const pkgOk = require('pkg-ok');

const run = function(tempdir, pkg) {
  return new Promise(function(resolve, reject) {
    try {
      pkgOk(tempdir);
      resolve({result: 'pass'});
    } catch (e) {
      resolve({result: 'fail', info: `\n${e}\n Is the file in pkg.json files list?`});
    }
  });
};

module.exports = run;
