const spawnPromise = require('@brandonocasey/spawn-promise');

const promiseSpawn = function(bin, args, options = {}) {
  options = Object.assign({}, options, {env: {PATH: process.env.PATH}, encoding: 'utf8'});

  return spawnPromise(bin, args, options).then(function(result) {
    return Promise.resolve({
      status: result.status,
      stderr: result.stderr.trim(),
      stdout: result.stdout.trim(),
      out: result.combined.trim()
    });
  });
};

module.exports = promiseSpawn;
