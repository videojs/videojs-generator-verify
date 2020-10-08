const pkgOk = require('pkg-ok');

const run = function(cwd) {
  return new Promise(function(resolve, reject) {
    try {
      pkgOk(cwd);
      resolve({result: 'pass'});
    } catch (e) {
      resolve({result: 'fail', info: `\n${e}\n Is the file in pkg.json files list?`});
    }
  });
};

module.exports = run;
