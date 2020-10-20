const {version} = require('../package.json');
const {cli, printHelp} = require('../src/cli.js');
const test = require('ava');
const tests = require('../src/tests.js');

const getConsoleEmulator = (lines) => (...args) => {
  if (!args.length) {
    lines.push('');
  } else {
    lines.push.apply(lines, args);
  }
};

const helpLines = [];

printHelp({log: getConsoleEmulator(helpLines)});

test.beforeEach((t) => {
  t.context.logs = [];
  t.context.errors = [];

  t.context.console = {
    log: getConsoleEmulator(t.context.logs),
    error: getConsoleEmulator(t.context.errors)
  };

  t.context.exitCode = null;
  t.context.exit = (exitCode = 0) => {
    t.context.exitCode = exitCode;
  };

  t.context.reset = () => {
    t.context.exitCode = null;
    t.context.logs.length = 0;
    t.context.errors.length = 0;
  };
});

['-h', '--help'].forEach(function(arg) {
  test(`${arg} logs help and exits`, function(t) {
    cli([arg], t.context.console, t.context.exit);

    t.deepEqual(t.context.logs, helpLines, 'logged help lines');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, 0, 'exited with success');
  });
});

['-v', '--version'].forEach(function(arg) {
  test(`${arg} logs version and exits`, function(t) {
    cli([arg], t.context.console, t.context.exit);

    t.deepEqual(t.context.logs, [version], 'logged version lines');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, 0, 'exited with success');
  });
});

['-V', '--verbose'].forEach(function(arg) {
  test(`${arg} adds verbose option, no exit or logs`, function(t) {
    const options = cli([arg], t.context.console, t.context.exit);

    t.is(t.context.logs.length, 0, 'no logs');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, null, 'no exit');
    t.deepEqual(options, {
      dir: process.cwd(),
      quiet: false,
      verbose: true
    }, 'verbose set to true');
  });
});

['-q', '--quiet'].forEach(function(arg) {
  test(`${arg} adds quiet option, no exit or logs`, function(t) {
    const options = cli([arg], t.context.console, t.context.exit);

    t.is(t.context.logs.length, 0, 'no logs');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, null, 'no exit');
    t.deepEqual(options, {
      dir: process.cwd(),
      quiet: true,
      verbose: false
    }, 'quiet set to true');
  });
});

['-d', '--dir'].forEach(function(arg) {
  test(`${arg} changes dir, no exit or logs`, function(t) {
    const options = cli([arg, 'foobar'], t.context.console, t.context.exit);

    t.is(t.context.logs.length, 0, 'no logs');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, null, 'no exit');
    t.deepEqual(options, {
      dir: 'foobar',
      quiet: false,
      verbose: false
    }, 'dir is set');
  });
});

test('--skip-es-check adds expected skip option, no exit or logs', function(t) {
  const options = cli(['--skip-es-check'], t.context.console, t.context.exit);

  t.is(t.context.logs.length, 0, 'no logs');
  t.is(t.context.errors.length, 0, 'no errors');
  t.is(t.context.exitCode, null, 'no exit');
  t.deepEqual(options, {
    dir: process.cwd(),
    quiet: false,
    verbose: false,
    skip: ['syntax']
  }, 'skip added');
});

Object.keys(tests).forEach(function(name) {
  test(`--skip-${name} adds expected skip option, no exit or logs`, function(t) {
    const options = cli([`--skip-${name}`], t.context.console, t.context.exit);

    t.is(t.context.logs.length, 0, 'no logs');
    t.is(t.context.errors.length, 0, 'no errors');
    t.is(t.context.exitCode, null, 'no exit');
    t.deepEqual(options, {
      dir: process.cwd(),
      quiet: false,
      verbose: false,
      skip: [name]
    }, 'skip added');
  });
});

test('all options long', function(t) {
  const skips = Object.keys(tests).map((name) => `--skip-${name}`);
  const options = cli(['--quiet', '--verbose', '--dir', 'foobar'].concat(skips), t.context.console, t.context.exit);

  t.is(t.context.logs.length, 0, 'no logs');
  t.is(t.context.errors.length, 0, 'no errors');
  t.is(t.context.exitCode, null, 'no exit');
  t.deepEqual(options, {
    dir: 'foobar',
    quiet: true,
    verbose: true,
    skip: Object.keys(tests)
  }, 'options changed');
});

test('all options short', function(t) {
  const skips = Object.keys(tests).map((name) => `--skip-${name}`);
  const options = cli(['-q', '-V', '-d', 'foobar'].concat(skips), t.context.console, t.context.exit);

  t.is(t.context.logs.length, 0, 'no logs');
  t.is(t.context.errors.length, 0, 'no errors');
  t.is(t.context.exitCode, null, 'no exit');
  t.deepEqual(options, {
    dir: 'foobar',
    quiet: true,
    verbose: true,
    skip: Object.keys(tests)
  }, 'options changed');
});
