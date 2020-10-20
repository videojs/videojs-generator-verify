const test = require('ava');
const path = require('path');
const fs = require('fs');
const fieldCheck = require('../src/tests/fields.js');
const setupTest = require('./setup-test.js');

setupTest(test);

test('can succeed', (t) => {
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'passed');
  });
});

test('fails if main does not exist', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.main));
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if module does not exist', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.module));
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if browser does not exist', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.browser));
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if bin does not exist', (t) => {
  const bins = t.context.pkg.bin;
  const binFile = bins[Object.keys(bins)[0]];

  fs.unlinkSync(path.join(t.context.dir, binFile));
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if bin exists but is not executable', (t) => {
  t.context.pkg.bin = {foo: './bar.js'};
  fs.writeFileSync(path.join(t.context.dir, 'bar.js'), 'console.log("here");');
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if es2015 does not exist', (t) => {
  t.context.pkg.es2015 = './not-exists.js';

  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));
  return fieldCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});
