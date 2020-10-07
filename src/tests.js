const pkgOk = require('./pkg-ok.js');
const esCheck = require('./es-check.js');
const pkgCanInstall = require('./pkg-can-install.js');

const tests = {
  install: {
    text: 'Package can be installed after publish',
    fn: pkgCanInstall
  },
  syntax: {
    text: 'Dist files have the correct js syntax',
    fn: esCheck
  },
  fields: {
    text: 'All package.json fields exist',
    fn: pkgOk
  }
};

module.exports = tests;
