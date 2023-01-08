/**
 * test app for setup
 * NOTE: regedit.exe is stubbed, so appCallback() will not be called on Windows.
 */

import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import readline from 'readline-sync';
import sinon from 'sinon';

import { Setup, isFile, removeDir } from '../../index.js';

const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

const map = new Map();

const appCallback = async arg => {
  const { manifestPath } = arg;
  map.set('manifestPath', manifestPath);
  console.info(`Callback called with arg ${arg}.`);
};

const stubSpawn = sinon.stub(childProcess, 'spawn').callsFake((cmd, args) => {
  console.info(`Stubbed: Called ${cmd} with args [${args}]`);
  return {
    on: arg => arg,
    stderr: {
      on: arg => arg
    },
    stdout: {
      on: arg => arg
    }
  };
});

const clean = () => {
  const file = map.get('manifestPath');
  if (isFile(file)) {
    fs.unlinkSync(file);
  }
  stubSpawn.restore();
  removeDir(path.join(TMPDIR, 'test-app'), TMPDIR);
  map.clear();
};

(async () => {
  const setup = new Setup({
    configPath: path.join(TMPDIR, 'test-app'),
    hostName: 'test-app',
    hostDescription: 'test application',
    chromeExtensionIds: ['chrome-extension://app'],
    webExtensionIds: ['app@test'],
    callback: appCallback
  });
  return setup.run();
})().then(() => {
  const ans = readline.keyInYNStrict('Remove created files?');
  if (ans) {
    console.info('Removing created files.');
    clean();
    console.info('Done.');
  }
}).catch(e => {
  clean();
  throw e;
});
