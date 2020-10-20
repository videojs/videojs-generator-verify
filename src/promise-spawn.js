const spawn = require('child_process').spawn;
const exitHook = require('exit-hook');

const promiseSpawn = function(bin, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, Object.assign({}, options, {env: {PATH: process.env.PATH}}));

    let stdout = '';
    let stderr = '';
    let out = '';

    child.stdout.on('data', function(chunk) {
      stdout += chunk;
      out += chunk;
    });

    child.stderr.on('data', function(chunk) {
      stderr += chunk;
      out += chunk;
    });

    const removeHook = exitHook(() => child.kill());

    child.on('close', function(status) {
      removeHook();
      resolve({
        status,
        out: out.toString().trim(),
        stderr: stderr.toString().trim(),
        stdout: stdout.toString().trim()
      });
    });
  });
};

module.exports = promiseSpawn;
