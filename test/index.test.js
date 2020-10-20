const test = require('ava');
const path = require('path');
const setupTest = require('./setup-test.js');
const promiseSpawn = require('../src/promise-spawn.js');
const verify = require('../src/index.js');
const shell = require('shelljs');
const fs = require('fs');

setupTest(test);

const vjsverify = path.join(__dirname, '..', 'src', 'cli.js');

test('can succeed via cli', (t) => {
  return promiseSpawn(vjsverify, [], {cwd: t.context.dir}).then(function(result) {
    t.is(result.out.trim(), '', 'no output on success');
    t.is(result.status, 0, 'returns success');
  });
});

test('can succeed via cli with --dir', (t) => {
  return promiseSpawn(vjsverify, ['--dir', t.context.dir], {cwd: shell.tempdir()}).then(function(result) {
    t.is(result.out.trim(), '', 'no output on success');
    t.is(result.status, 0, 'returns success');
  });
});

test('can succeed via api', (t) => {
  return verify({dir: t.context.dir}).then(function(exitCode) {
    t.is(exitCode, 0, 'success');
  });
});

test('--skip-syntax with bad syntax works via cli', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, t.context.pkg.module));
  return promiseSpawn(vjsverify, ['--skip-syntax'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 0, 'returns success');
    t.is(result.out.trim(), '', 'no output on success');
  });
});

test('--skip-syntax with bad syntax works via api', (t) => {
  shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, t.context.pkg.module));
  return verify({dir: t.context.dir, skip: ['syntax']}).then(function(exitCode) {
    t.is(exitCode, 0, 'success');
  });
});

test('--skip-require with bad require works via cli', (t) => {
  fs.appendFileSync(path.join(t.context.dir, t.context.pkg.main), '\nrequire("./nope.js");');
  return promiseSpawn(vjsverify, ['--skip-require'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.out.trim(), '', 'no output on success');
    t.is(result.status, 0, 'returns success');
  });
});

test('--skip-require with bad require works via api', (t) => {
  fs.appendFileSync(path.join(t.context.dir, t.context.pkg.main), '\nrequire("./nope.js");');
  return verify({dir: t.context.dir, skip: ['require']}).then(function(exitCode) {
    t.is(exitCode, 0, 'success');
  });
});

test('--skip-fields with bad field works via cli', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.module));
  return promiseSpawn(vjsverify, ['--skip-fields'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.out.trim(), '', 'no output on success');
    t.is(result.status, 0, 'returns success');
  });
});

test('--skip-fields with bad field works via api', (t) => {
  fs.unlinkSync(path.join(t.context.dir, t.context.pkg.module));
  return verify({dir: t.context.dir, skip: ['fields']}).then(function(exitCode) {
    t.is(exitCode, 0, 'success');
  });
});

test('--skip-install with bad dep works via cli', (t) => {
  const name = 'a-package-with-such-a-long-name-it-should-not-exist';

  t.context.pkg.dependencies = {};
  t.context.pkg.dependencies[name] = '200000000000000000';
  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));

  return promiseSpawn(vjsverify, ['--skip-install', '--skip-require'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.out.trim(), '', 'no output on success');
    t.is(result.status, 0, 'returns success');
  });
});

test('--skip-install with bad dep works via api', (t) => {
  const name = 'a-package-with-such-a-long-name-it-should-not-exist';

  t.context.pkg.dependencies = {};
  t.context.pkg.dependencies[name] = '200000000000000000';
  fs.writeFileSync(path.join(t.context.dir, 'package.json'), JSON.stringify(t.context.pkg));

  return verify({dir: t.context.dir, skip: ['install', 'require']}).then(function(exitCode) {
    t.is(exitCode, 0, 'success');
  });
});
