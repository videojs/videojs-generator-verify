const test = require('ava');
const path = require('path');
const shell = require('shelljs');
const syntaxCheck = require('../src/tests/syntax.js');
const setupTest = require('./setup-test.js');

setupTest(test);

test('can succeed', (t) => {
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'passed');
  });
});

test('skipped if no files exist', (t) => {
  shell.rm('-rf', path.join(t.context.dir, 'dist'));
  shell.rm('-rf', path.join(t.context.dir, 'cjs'));
  shell.rm('-rf', path.join(t.context.dir, 'es'));
  Object.keys(t.context.pkg.bin).forEach((k) => {
    shell.rm('-rf', path.join(t.context.dir, t.context.pkg.bin[k]));
  });
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'skip', 'skipped');
  });
});

test('fails if module has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, t.context.pkg.module));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if main has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, t.context.pkg.main));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if browser has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, t.context.pkg.browser));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('does not fail if bin has incorrect syntax', (t) => {
  const bins = t.context.pkg.bin;
  const binFile = bins[Object.keys(bins)[0]];

  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, binFile));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'pass', 'pass');
  });
});

test('fails if lang has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'lang', 'es.js'));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('fails if cjs dir has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'cjs', 'foo.js'));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('does not fail if es dir has incorrect syntax', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'es', 'foo.js'));
  return syntaxCheck(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'pass', 'pass');
  });
});
