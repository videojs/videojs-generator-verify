const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const {allFields, getFieldFiles} = require('../pkg-field-helpers.js');

const run = function(tempdir, pkg, cache) {
  return Promise.resolve().then(function() {
    const errors = [];

    allFields.forEach((field) => {
      const files = getFieldFiles(pkg, [field]);

      files.forEach(function(file) {
        const filepath = path.join(tempdir, file);

        if (!shell.test('-f', filepath)) {
          errors.push(`file: "${file}" listed in package.json under field ${field} does not exist!`);
        }

        if (field !== 'bin') {
          return;
        }

        try {
          fs.accessSync(filepath, fs.constants.X_OK);
        } catch (e) {
          errors.push(`file: "${file}" listed as a bin in package.json is not executable`);
        }
      });
    });

    if (errors.length === 0) {
      return Promise.resolve({result: 'pass'});
    }
    return Promise.resolve({
      result: 'fail',
      info: `\n${errors.join('\n')}\n Are all files listed in the package.json files list?`
    });
  });
};

module.exports = run;
