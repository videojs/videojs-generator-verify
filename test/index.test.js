import test from 'ava';
import promiseSpawn from '../src/promise-spawn';
import path from 'path';
import shell from 'shelljs';
import crypto from 'crypto';
import fs from 'fs';

const BASE_DIR = path.join(__dirname, '..');
const TEMP_DIR = shell.tempdir();
const FIXTURE_DIR = path.join(__dirname, 'fixture');
const vjsverify = path.join(BASE_DIR, 'src/cli.js');

const getTempDir = function() {
  return path.join(TEMP_DIR, crypto.randomBytes(20).toString('hex'));
};

test.beforeEach((t) => {
  t.context.dir = getTempDir();
  shell.cp('-R', FIXTURE_DIR, t.context.dir);
});

test.afterEach.always((t) => {
  shell.rm('-rf', t.context.dir);
});

test.after.always((t) => {
  shell.rm('-rf', path.join(FIXTURE_DIR, 'node_modules'));
});

test('can succeed', (t) => {
  return promiseSpawn(vjsverify, [], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 0, 'returns success');
    t.is(result.out.trim().length, 0, 'no output on success');
  });
});

test('can succeed with --verbose', (t) => {
  return promiseSpawn(vjsverify, ['--verbose'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 0, 'returns success');
    t.true(result.out.trim().length > 0, 'output on success with --verbose');
  });
});

test('can succeed with --dir', (t) => {
  return promiseSpawn(vjsverify, ['--dir', t.context.dir], {cwd: process.cwd()}).then(function(result) {
    t.is(result.status, 0, 'returns success');
    t.is(result.out.trim().length, 0, 'no output on success');
  });
});

test('failure with --quiet has no output', (t) => {
  const pkgPath = path.join(t.context.dir, 'package.json');
  const pkg = JSON.parse(shell.cat(pkgPath));

  pkg.scripts.postinstall = 'foo-bar-command-does-not-exist';

  // write new package
  shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

  return promiseSpawn(vjsverify, ['--quiet'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 1, 'returns failure');
    t.is(result.out.trim().length, 0, 'no output with --quiet');
  });
});

test('fails if passed invalid skip', (t) => {
  return promiseSpawn(vjsverify, ['--skip-foo'], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 1, 'returns failure');
    t.true(result.out.trim().length > 0, 'output on failure');
  });
});

['--skip-es-check', '--skip-syntax', 'fails'].forEach(function(arg) {
  const args = ['--skip-require'];

  if (arg !== 'fails') {
    args.push(arg);
  }
  const testName = arg === 'fails' ? 'fails' : `but succeeds with ${arg}`;
  const checkResult = function(t, result) {
    if (arg === 'fails') {
      t.true(result.status > 0, 'failure');
      t.true(result.out.trim().length > 0, 'output on failure');
    } else {
      t.is(result.status, 0, 'returns success');
      t.is(result.out.trim().length, 0, 'no output on success');
    }
  };

  test(`syntax: dists have wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'videojs-test.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: bins have wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'foo.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: es dists have wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'es', 'foo.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: cjs dists have wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'cjs', 'foo.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: lang dists have wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'lang', 'foo.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: main has wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'videojs-test.cjs.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: module has wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'videojs-test.es.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });

  test(`syntax: browser has wrong syntax ${testName}`, (t) => {
    shell.cp('-f', path.join(t.context.dir, 'es6.js'), path.join(t.context.dir, 'dist', 'videojs-test.js'));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir})
      .then((result) => checkResult(t, result));
  });
});

['--skip-install', 'fails'].forEach(function(arg) {
  const args = ['--skip-require'];

  if (arg !== 'fails') {
    args.push(arg);
  }
  const testName = arg === 'fails' ? 'fails' : `but succeeds with ${arg}`;
  const checkResult = function(t, result) {
    if (arg === 'fails') {
      t.true(result.status > 0, 'failure');
      t.true(result.out.trim().length > 0, 'output on failure');
    } else {
      t.is(result.status, 0, 'returns success');
      t.is(result.out.trim().length, 0, 'no output on success');
    }
  };

  test(`install: bad postinstall ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    pkg.scripts.postinstall = 'foo-bar-command-does-not-exist';

    // write new package
    shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });

  test(`install: bad dependency ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    pkg.dependencies = {failure: 'this-is-not-a-thing'};

    // write new package
    shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });

});

['--skip-fields', 'fails'].forEach(function(arg) {
  const args = ['--skip-require'];

  if (arg !== 'fails') {
    args.push(arg);
  }
  const testName = arg === 'fails' ? 'fails' : `but succeeds with ${arg}`;
  const checkResult = function(t, result) {
    if (arg === 'fails') {
      t.true(result.status > 0, 'failure');
      t.true(result.out.trim().length > 0, 'output on failure');
    } else {
      t.is(result.status, 0, 'returns success');
      t.is(result.out.trim().length, 0, 'no output on success');
    }
  };

  test(`fields: pkg.json points to missing main ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    pkg.main = 'bar.js';

    // write new package
    shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });

  test(`fields: pkg.json points to missing module ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    pkg.module = 'bar.js';

    // write new package
    shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });

  test(`fields: pkg.json points to missing browser ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    pkg.browser = 'bar.js';

    // write new package
    shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });
});

['--skip-require', 'fails'].forEach(function(arg) {
  const args = [];

  if (arg !== 'fails') {
    args.push(arg);
  }
  const testName = arg === 'fails' ? 'fails' : `but succeeds with ${arg}`;
  const checkResult = function(t, result) {
    if (arg === 'fails') {
      t.true(result.status > 0, 'failure');
      t.true(result.out.trim().length > 0, 'output on failure');
    } else {
      t.is(result.status, 0, 'returns success');
      t.is(result.out.trim().length, 0, 'no output on success');
    }
  };

  test(`require: bad require statement ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    // write new package
    fs.writeFileSync(path.join(t.context.dir, pkg.main), "require('foobar');");

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });

  test(`require: syntax error ${testName}`, (t) => {
    const pkgPath = path.join(t.context.dir, 'package.json');
    const pkg = JSON.parse(shell.cat(pkgPath));

    // write new package
    shell.ShellString('forbarbuzz').to(path.join(t.context.dir, pkg.main));

    return promiseSpawn(vjsverify, args, {cwd: t.context.dir}).then((result) => checkResult(t, result));
  });
});

// fails install and fields
test('pkg.json points to missing bin fails', (t) => {
  const pkgPath = path.join(t.context.dir, 'package.json');
  const pkg = JSON.parse(shell.cat(pkgPath));

  pkg.bin = {foo: './bar.js'};

  // write new package
  shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

  return promiseSpawn(vjsverify, [], {cwd: t.context.dir}).then(function(result) {
    t.true(result.status > 0, 'failure');
    t.true(result.out.trim().length > 0, 'output on failure');
  });
});

// fails fields/require
test('fails if package would not be published with correct files', (t) => {
  const pkgPath = path.join(t.context.dir, 'package.json');
  const pkg = JSON.parse(shell.cat(pkgPath));

  pkg.files = ['bar.js'];

  // write new package
  shell.ShellString(JSON.stringify(pkg, null, 2)).to(pkgPath);

  return promiseSpawn(vjsverify, [], {cwd: t.context.dir}).then(function(result) {
    t.is(result.status, 1, 'returns failure');
    t.true(result.out.trim().length > 0, 'output on failure');
  });
});
