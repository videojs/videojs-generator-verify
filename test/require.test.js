const test = require('ava');
const path = require('path');
const fs = require('fs');
const canRequire = require('../src/tests/require.js');
const setupTest = require('./setup-test.js');

setupTest(test);

test('can succeed', (t) => {
  return canRequire(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'passed');
  });
});

test('skipped if pkg has no main', (t) => {
  delete t.context.pkg.main;
  return canRequire(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'skip', 'skipped');
  });
});

test('fails if main does not exist', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.main));
  return canRequire(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if main requires un-installed package', (t) => {
  fs.appendFileSync(path.join(t.context.dir, t.context.pkg.main), '\nrequire("./nope.js");');
  return canRequire(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails on bad syntax', (t) => {
  fs.appendFileSync(path.join(t.context.dir, t.context.pkg.main), 'fizzbus\nbazbuzz');
  return canRequire(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});
