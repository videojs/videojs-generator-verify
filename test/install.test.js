const test = require('ava');
const path = require('path');
const fs = require('fs');
const canInstall = require('../src/tests/install.js');
const setupTest = require('./setup-test.js');

setupTest(test);

test('can succeed', (t) => {
  return canInstall(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'passed');
  });
});

test('can succeed with a scoped package', (t) => {
  t.context.pkg.name = '@scope/foo';

  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));

  return canInstall(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'passed');
  });
});

test('fails if dependency does not exist', (t) => {
  const name = 'a-package-with-such-a-long-name-it-should-not-exist';

  t.context.pkg.dependencies = {};
  t.context.pkg.dependencies[name] = '200000000000000000';
  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));

  return canInstall(t.context.dir, t.context.pkg).then(function(r) {
    t.not(r.info, '', 'has info');
    t.is(r.result, 'fail', 'failed');
  });
});

test('does not fail if devDependency does not exist', (t) => {
  const name = 'a-package-with-such-a-long-name-it-should-not-exist';

  t.context.pkg.devDependencies = {};
  t.context.pkg.devDependencies[name] = '200000000000000000';
  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));

  return canInstall(t.context.dir, t.context.pkg).then(function(r) {
    t.is(r.result, 'pass', 'success');
  });
});

