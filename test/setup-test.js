const path = require('path');
const shell = require('shelljs');
const crypto = require('crypto');
const fs = require('fs');
const TEMP_DIR = shell.tempdir();
const FIXTURE_DIR = path.join(__dirname, 'fixture');
const packInstall = require('../src/pack-install.js');

const getTempDir = function() {
  return path.join(TEMP_DIR, crypto.randomBytes(36).toString('hex'));
};

const setupTest = function(test) {
  test.beforeEach((t) => {
    packInstall.cache = null;
    t.context.dir = getTempDir();
    t.context.pkg = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, 'package.json')));
    shell.cp('-R', FIXTURE_DIR, t.context.dir);
  });

  test.afterEach.always((t) => {
    shell.rm('-rf', t.context.dir);
  });

};

module.exports = setupTest;
