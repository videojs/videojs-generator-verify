const fields = require('./tests/fields.js');
const syntax = require('./tests/syntax.js');
const install = require('./tests/install.js');
const req = require('./tests/require');

const tests = {
  install: {
    text: 'Package can be installed after publish',
    fn: install
  },
  syntax: {
    text: 'Dist files have the correct js syntax',
    fn: syntax
  },
  fields: {
    text: 'All package.json fields exist',
    fn: fields
  },
  require: {
    text: 'Can require using nodejs',
    fn: req
  }
};

module.exports = tests;
