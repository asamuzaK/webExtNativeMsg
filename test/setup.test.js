/* api */
import { strict as assert } from 'node:assert';
import childProcess from 'node:child_process';
import EventEmitter from 'node:events';
import fs, { promises as fsPromise } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { quoteArg } from '../modules/common.js';
import { createDirectory, isDir, isFile } from '../modules/file-util.js';
import {
  DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME, IS_MAC, IS_WIN
} from '../modules/constant.js';

/* test */
import {
  Setup, getBrowserData, getConfigDir, handleInquirerError, inquirer
} from '../modules/setup.js';

/* constant */
const DIR_CONFIG = (IS_WIN && DIR_CONFIG_WIN) || (IS_MAC && DIR_CONFIG_MAC) ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const TMPDIR = path.join(DIR_CWD, 'tmp');

beforeEach(() => {
  fs.rmSync(TMPDIR, {
    force: true,
    recursive: true
  });
});
afterEach(() => {
  fs.rmSync(TMPDIR, {
    force: true,
    recursive: true
  });
});

describe('handleInquirerError', () => {
  it('should throw unknown error message', () => {
    assert.throws(
      () => { handleInquirerError('foo'); },
      { message: 'Unknown error.' }
    );
  });

  it('should throw original message', () => {
    assert.throws(
      () => { handleInquirerError(new Error('foo')); },
      { message: 'foo' }
    );
  });

  it('should throw user aborted message', () => {
    const e = new Error('foo');
    e.name = 'ExitPromptError';
    assert.throws(
      () => { handleInquirerError(e); },
      { message: 'Setup aborted by user.' }
    );
  });
});

describe('getBrowserData', () => {
  it('should get object if key matches', () => {
    assert.strictEqual(typeof getBrowserData('firefox'), 'object');
  });

  it('should get object if key matches', () => {
    assert.strictEqual(typeof getBrowserData('chrome'), 'object');
  });

  it('should get null if no argument given', () => {
    assert.deepEqual(getBrowserData(), null);
  });

  it('should get null if key does not match', () => {
    assert.deepEqual(getBrowserData('foo'), null);
  });
});

describe('getConfigDir', () => {
  it("should throw if dir is not subdirectory of user's home dir", () => {
    assert.throws(
      () => getConfigDir({
        configPath: '/foo/bar'
      }), Error,
      `${path.normalize('/foo/bar')} is not sub directory of ${DIR_HOME}.`
    );
  });

  it("should throw if dir is not subdirectory of user's home dir", () => {
    assert.throws(
      () => getConfigDir({
        configPath: path.join(DIR_HOME, '../foo')
      }), Error,
      `${path.join(DIR_HOME, '../foo')} is not sub directory of ${DIR_HOME}.`);
  });

  it('should get dir', () => {
    const configPath = path.join('foo', 'bar');
    const res = getConfigDir({ configPath });
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join('foo', '../bar/baz');
    const res = getConfigDir({ configPath });
    assert.strictEqual(configPath, path.join('bar', 'baz'));
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join(DIR_CONFIG, 'foo', 'config');
    const res = getConfigDir({
      hostName: 'foo'
    });
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join(DIR_CWD, 'config');
    const res = getConfigDir();
    assert.strictEqual(res, path.resolve(configPath));
  });
});

describe('Setup', () => {
  it('should create an instance', () => {
    const setup = new Setup();
    assert.strictEqual(setup instanceof Setup, true);
  });

  describe('constructor', () => {
    it('should set browser', () => {
      const browser = 'firefox';
      const setup = new Setup({
        browser
      });
      assert.strictEqual(setup.browser, browser);
    });

    it('should set supportedBrowsers', () => {
      const supportedBrowsers = ['firefox', 'chrome'];
      const setup = new Setup({
        supportedBrowsers
      });
      assert.deepEqual(setup.supportedBrowsers, ['firefox', 'chrome']);
    });

    it('should set configPath', () => {
      const configPath = path.join('test', 'file', 'config');
      const setup = new Setup({
        configPath
      });
      assert.strictEqual(setup.configPath, path.resolve(configPath));
    });

    it('should set configPath', () => {
      const configPath = path.resolve('test', 'file', 'config');
      const setup = new Setup({
        configPath
      });
      assert.strictEqual(setup.configPath, path.resolve(configPath));
    });

    it('should set hostDescription', () => {
      const hostDescription = 'foo bar';
      const setup = new Setup({
        hostDescription
      });
      assert.strictEqual(setup.hostDescription, hostDescription);
    });

    it('should set hostName', () => {
      const hostName = 'foo';
      const setup = new Setup({
        hostName
      });
      assert.strictEqual(setup.hostName, hostName);
    });

    it('should set mainScriptFile', () => {
      const mainScriptFile = 'foo.js';
      const setup = new Setup({
        mainScriptFile
      });
      assert.strictEqual(setup.mainScriptFile, mainScriptFile);
    });

    it('should set chromeExtensionIds', () => {
      const chromeExtensionIds = ['chrome-extension://foo'];
      const setup = new Setup({
        chromeExtensionIds
      });
      assert.deepEqual(setup.chromeExtensionIds, chromeExtensionIds);
    });

    it('should set webExtensionIds', () => {
      const webExtensionIds = ['foo@bar'];
      const setup = new Setup({
        webExtensionIds
      });
      assert.deepEqual(setup.webExtensionIds, webExtensionIds);
    });

    it('should set callback', () => {
      const myCallback = a => a;
      const setup = new Setup({
        callback: myCallback
      });
      assert.strictEqual(typeof setup.callback, 'function');
      assert.strictEqual(setup.callback.name, 'myCallback');
    });

    it('should set overwriteConfig', () => {
      const overwriteConfig = true;
      const setup = new Setup({
        overwriteConfig
      });
      assert.strictEqual(setup.overwriteConfig, !!overwriteConfig);
    });

    it('should set overwriteConfig', () => {
      const overwriteConfig = false;
      const setup = new Setup({
        overwriteConfig
      });
      assert.strictEqual(setup.overwriteConfig, !!overwriteConfig);
    });
  });

  describe('getters', () => {
    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.browser, null);
    });

    it('should get object', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      assert.deepEqual(setup.browser, 'firefox');
    });

    it('should get array', () => {
      const setup = new Setup();
      assert.strictEqual(Array.isArray(setup.supportedBrowsers), true);
    });

    it('should get string', () => {
      const setup = new Setup();
      assert.strictEqual(setup.configPath, path.resolve(DIR_CWD, 'config'));
    });

    it('should get string', () => {
      const configPath = path.join(DIR_HOME, 'foo', 'bar');
      const setup = new Setup({
        configPath
      });
      assert.strictEqual(setup.configPath, path.resolve(configPath));
    });

    it('should get string', () => {
      const setup = new Setup({
        hostName: 'myhost'
      });
      assert.strictEqual(setup.configPath,
        path.resolve(DIR_CONFIG, 'myhost', 'config'));
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.hostDescription, null);
    });

    it('should get string', () => {
      const setup = new Setup({
        hostDescription: 'My host description'
      });
      assert.strictEqual(setup.hostDescription, 'My host description');
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.hostName, null);
    });

    it('should get string', () => {
      const setup = new Setup({
        hostName: 'myhost'
      });
      assert.strictEqual(setup.hostName, 'myhost');
    });

    it('should get string', () => {
      const setup = new Setup({
        mainScriptFile: 'main.js'
      });
      assert.strictEqual(setup.mainScriptFile, 'main.js');
    });

    it('should get string', () => {
      const setup = new Setup();
      assert.strictEqual(setup.mainScriptFile, 'index.js');
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.chromeExtensionIds, null);
    });

    it('should get array', () => {
      const setup = new Setup({
        chromeExtensionIds: ['chrome-extension://foo']
      });
      assert.deepEqual(setup.chromeExtensionIds, ['chrome-extension://foo']);
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.webExtensionIds, null);
    });

    it('should get array', () => {
      const setup = new Setup({
        webExtensionIds: ['foo@bar']
      });
      assert.deepEqual(setup.webExtensionIds, ['foo@bar']);
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.deepEqual(setup.callback, null);
    });

    it('should get function', () => {
      const setup = new Setup({
        callback: a => a
      });
      assert.strictEqual(typeof setup.callback, 'function');
    });

    it('should get false', () => {
      const setup = new Setup();
      assert.strictEqual(setup.overwriteConfig, false);
    });

    it('should get false', () => {
      const setup = new Setup({
        overwriteConfig: false
      });
      assert.strictEqual(setup.overwriteConfig, false);
    });

    it('should get true', () => {
      const setup = new Setup({
        overwriteConfig: true
      });
      assert.strictEqual(setup.overwriteConfig, true);
    });
  });

  describe('setters', () => {
    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = '';
      assert.deepEqual(setup.browser, null);
    });

    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = 'foo';
      assert.deepEqual(setup.browser, null);
    });

    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = 1;
      assert.deepEqual(setup.browser, null);
    });

    it('should set string', () => {
      const setup = new Setup({
        browser: 'chrome'
      });
      setup.browser = 'firefox';
      assert.strictEqual(setup.browser, 'firefox');
    });

    it('should set array', () => {
      const setup = new Setup();
      setup.supportedBrowsers = ['firefox', 'chrome'];
      assert.deepEqual(setup.supportedBrowsers, ['firefox', 'chrome']);
    });

    it('should keep array', () => {
      const setup = new Setup({
        supportedBrowsers: ['firefox', 'chrome']
      });
      setup.supportedBrowsers = 'foo';
      assert.deepEqual(setup.supportedBrowsers, ['firefox', 'chrome']);
    });

    it('should keep array', () => {
      const setup = new Setup({
        supportedBrowsers: ['firefox', 'chrome']
      });
      setup.supportedBrowsers = [];
      assert.deepEqual(setup.supportedBrowsers, ['firefox', 'chrome']);
    });

    it('should throw', () => {
      const myPath = '/foo/bar';
      const setup = new Setup();
      assert.throws(
        () => { setup.configPath = myPath; }, Error,
        `${path.normalize('/foo/bar')} is not sub directory of ${DIR_HOME}.`
      );
    });

    it('should set string', () => {
      const myPath = path.resolve(DIR_CWD, 'foo');
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it('should set string', () => {
      const myPath = path.resolve(DIR_CONFIG, 'myhost', 'config');
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it('should set string', () => {
      const setup = new Setup({
        hostName: 'myhost'
      });
      setup.configPath = null;
      assert.strictEqual(setup.configPath,
        path.resolve(DIR_CONFIG, 'myhost', 'config'));
    });

    it('should set null', () => {
      const setup = new Setup({
        hostDescription: 'My host description'
      });
      setup.hostDescription = 1;
      assert.deepEqual(setup.hostDescription, null);
    });

    it('should set string', () => {
      const setup = new Setup();
      setup.hostDescription = 'My host description';
      assert.strictEqual(setup.hostDescription, 'My host description');
    });

    it('should set null', () => {
      const setup = new Setup({
        hostName: 'myhost'
      });
      setup.hostName = 1;
      assert.deepEqual(setup.hostName, null);
    });

    it('should set string', () => {
      const setup = new Setup();
      setup.hostName = 'myhost';
      assert.strictEqual(setup.hostName, 'myhost');
    });

    it('should set string', () => {
      const setup = new Setup({
        mainScriptFile: 'main.js'
      });
      setup.mainScriptFile = 1;
      assert.strictEqual(setup.mainScriptFile, 'index.js');
    });

    it('should set string', () => {
      const setup = new Setup();
      setup.mainScriptFile = 'main.js';
      assert.strictEqual(setup.mainScriptFile, 'main.js');
    });

    it('should set null', () => {
      const setup = new Setup({
        chromeExtensionIds: ['chrome-extension://foo']
      });
      setup.chromeExtensionIds = [];
      assert.deepEqual(setup.chromeExtensionIds, null);
    });

    it('should set array', () => {
      const setup = new Setup();
      setup.chromeExtensionIds = ['chrome-extension://foo'];
      assert.deepEqual(setup.chromeExtensionIds, ['chrome-extension://foo']);
    });

    it('should set null', () => {
      const setup = new Setup({
        webExtensionIds: ['myapp@webextension']
      });
      setup.webExtensionIds = [];
      assert.deepEqual(setup.webExtensionIds, null);
    });

    it('should set array', () => {
      const setup = new Setup();
      setup.webExtensionIds = ['myapp@webextension'];
      assert.deepEqual(setup.webExtensionIds, ['myapp@webextension']);
    });

    it('should set null', () => {
      const myCallback = a => a;
      const setup = new Setup({
        callback: myCallback
      });
      setup.callback = 1;
      assert.deepEqual(setup.callback, null);
    });

    it('should set function', () => {
      const myCallback = a => a;
      const setup = new Setup();
      setup.callback = myCallback;
      assert.strictEqual(typeof setup.callback, 'function');
      assert.strictEqual(setup.callback.name, 'myCallback');
    });

    it('should set true', () => {
      const setup = new Setup();
      setup.overwriteConfig = true;
      assert.strictEqual(setup.overwriteConfig, true);
    });

    it('should set false', () => {
      const setup = new Setup({
        overwriteConfig: true
      });
      setup.overwriteConfig = false;
      assert.strictEqual(setup.overwriteConfig, false);
    });
  });
});

describe('_getBrowserConfigDir', () => {
  it('should get null', () => {
    const browser = IS_WIN ? 'Chromium' : 'CentBrowser';
    const setup = new Setup({
      browser
    });
    const res = setup._getBrowserConfigDir();
    assert.deepEqual(res, null);
  });

  it('should get string', () => {
    const setup = new Setup({
      browser: 'firefox'
    });
    const res = setup._getBrowserConfigDir();
    assert.strictEqual(typeof res, 'string');
  });
});

describe('_createReg', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._createReg().catch(e => {
      assert.deepStrictEqual(e, new Error('No such file: undefined.'));
    });
  });

  it('should throw', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const setup = new Setup();
    await setup._createReg(manifestPath).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected Object but got Null.'));
    });
  });

  it('should throw', async () => {
    const manifestPath =
      path.resolve(path.join('test', 'file', 'config', 'firefox', 'test.json'));
    const setup = new Setup({
      browser: 'firefox'
    });
    await setup._createReg(manifestPath).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
  });

  it('should spawn child process', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    const i = stubSpawn.callCount;
    const setup = new Setup({
      browser: 'firefox',
      hostName: 'foo'
    });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      setTimeout(() => mockProcess.emit('close', 0), 10);
    }
    const res = await promise;
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(res, undefined);
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(res, undefined);
    }
    stubSpawn.restore();
  });

  it('should reject if child process emits stderr', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    let errorLog;
    const stubError = sinon.stub(console, 'error').callsFake(msg => {
      errorLog = msg;
    });
    const setup = new Setup({
      browser: 'firefox',
      hostName: 'foo'
    });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      setTimeout(() => mockProcess.stderr.emit('data', Buffer.from('mock error')), 10);
      await promise.catch(e => {
        assert.deepStrictEqual(e, new Error('Failed to create registry key.'));
      });
      assert.strictEqual(stubError.calledOnce, true);
      assert.strictEqual(errorLog, 'stderr: mock error');
    } else {
      const res = await promise;
      assert.strictEqual(res, undefined);
      assert.strictEqual(stubError.called, false);
    }
    stubSpawn.restore();
    stubError.restore();
  });

  it('should reject if child process exits with non-zero code', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    const setup = new Setup({
      browser: 'firefox',
      hostName: 'foo'
    });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      const winDir = process.env.windir || process.env.WINDIR || 'C:\\Windows';
      const reg = path.join(winDir, 'System32', 'reg.exe');
      const errorCode = 1;
      setTimeout(() => mockProcess.emit('close', errorCode), 10);
      await promise.catch(e => {
        assert.deepStrictEqual(e, new Error(`${reg} exited with ${errorCode}.`));
      });
    } else {
      const res = await promise;
      assert.strictEqual(res, undefined);
    }
    stubSpawn.restore();
  });

  it('should ignore error event if already settled', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    const stubInfo = sinon.stub(console, 'info');
    const setup = new Setup({ browser: 'firefox', hostName: 'foo' });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      await new Promise(resolve => {
        setTimeout(() => {
          mockProcess.emit('close', 0);
          assert.doesNotThrow(() => {
            mockProcess.emit('error', new Error('late error'));
          });
          resolve();
        }, 10);
      });
      await promise;
    } else {
      const res = await promise;
      assert.strictEqual(res, undefined);
    }
    stubSpawn.restore();
    stubInfo.restore();
  });

  it('should ignore stderr data if already settled', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    const stubInfo = sinon.stub(console, 'info');
    const stubError = sinon.stub(console, 'error');
    const setup = new Setup({ browser: 'firefox', hostName: 'foo' });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      await new Promise(resolve => {
        setTimeout(() => {
          mockProcess.emit('close', 0);
          mockProcess.stderr.emit('data', Buffer.from('late stderr data'));
          resolve();
        }, 10);
      });
      await promise;
      assert.strictEqual(stubError.called, false);
    } else {
      const res = await promise;
      assert.strictEqual(res, undefined);
    }
    stubSpawn.restore();
    stubInfo.restore();
    stubError.restore();
  });

  it('should ignore close event if already settled', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const mockProcess = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    const stubInfo = sinon.stub(console, 'info');
    const setup = new Setup({ browser: 'firefox', hostName: 'foo' });
    const promise = setup._createReg(manifestPath);
    if (IS_WIN) {
      const testError = new Error('early error');
      await new Promise(resolve => {
        setTimeout(() => {
          mockProcess.emit('error', testError);
          mockProcess.emit('close', 0);
          resolve();
        }, 10);
      });
      await promise.catch(e => {
        assert.deepStrictEqual(e, testError);
      });
      assert.strictEqual(stubInfo.called, false);
    } else {
      const res = await promise;
      assert.strictEqual(res, undefined);
    }
    stubSpawn.restore();
    stubInfo.restore();
  });
});

describe('_createManifest', () => {
  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const setup = new Setup();
    await setup._createManifest().catch(e => {
      assert.deepStrictEqual(e, new Error('No such file: undefined.'));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file = path.resolve(DIR_CWD, IS_WIN ? 'foo.cmd' : 'foo.sh');
    const setup = new Setup();
    await setup._createManifest(file).catch(e => {
      assert.deepStrictEqual(e, new Error(`No such file: ${file}.`));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar',
      hostName: 'foo',
      webExtensionIds: ['foo@bar']
    });
    if (IS_WIN) {
      await setup._createManifest(file).catch(e => {
        assert.deepStrictEqual(e, new Error('No such directory: undefined.'));
      });
    }
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'chrome',
      hostDescription: 'foo bar',
      hostName: 'foo',
      chromeExtensionIds: ['chrome-extension://foo']
    });
    if (IS_WIN) {
      await setup._createManifest(file).catch(e => {
        assert.deepStrictEqual(e, new Error('No such directory: undefined.'));
      });
    }
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const dir = path.resolve(DIR_HOME, 'foo');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar',
      hostName: 'foo',
      webExtensionIds: ['foo@bar']
    });
    if (IS_WIN) {
      await setup._createManifest(file, dir).catch(e => {
        assert.deepStrictEqual(e, new Error(`No such directory: ${dir}.`));
      });
    }
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup();
    await setup._createManifest(file, DIR_HOME).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected Object but got Null.'));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox'
    });
    await setup._createManifest(file, DIR_HOME).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar'
    });
    await setup._createManifest(file, DIR_HOME).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should throw', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar',
      hostName: 'foo'
    });
    await setup._createManifest(file, DIR_HOME).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected Array but got Null.'));
    });
    assert.strictEqual(stubWrite.called, false);
    stubWrite.restore();
  });

  it('should create manifest', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const spyMkdir = sinon.spy(fsPromise, 'mkdir');
    const spyWrite = sinon.spy(fsPromise, 'writeFile');
    const dir = path.join(TMPDIR, 'webextnativemsg');
    const configDir = fs.mkdirSync(path.join(dir, 'config', 'firefox'), {
      recursive: true
    });
    const shellPath =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar',
      hostName: 'foo',
      webExtensionIds: ['foo@bar']
    });
    const res = await setup._createManifest(shellPath, configDir);
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: mkdirCallCount } = spyMkdir;
    const { calledOnce: writeCalled } = spyWrite;
    stubInfo.restore();
    spyWrite.restore();
    spyMkdir.restore();
    let manifestPath;
    if (IS_WIN) {
      manifestPath = path.join(configDir, 'foo.json');
    } else if (IS_MAC) {
      manifestPath = path.join(os.homedir(), 'Library', 'Application Support',
        'Mozilla', 'NativeMessagingHosts', 'foo.json');
    } else {
      manifestPath = path.join(os.homedir(), '.mozilla',
        'native-messaging-hosts', 'foo.json');
    }
    const file = fs.readFileSync(manifestPath, {
      encoding: 'utf8',
      flag: 'r'
    });
    const parsedFile = JSON.parse(file);
    assert.strictEqual(infoCalled, true);
    if (IS_WIN) {
      assert.strictEqual(mkdirCallCount, 0);
    } else {
      assert.strictEqual(mkdirCallCount, 1);
    }
    assert.strictEqual(writeCalled, true);
    assert.strictEqual(info, `Created: ${manifestPath}`);
    assert.strictEqual(res, manifestPath);
    assert.strictEqual(isFile(manifestPath), true);
    assert.strictEqual(file.endsWith('\n'), true);
    assert.deepEqual(parsedFile, {
      allowed_extensions: ['foo@bar'],
      description: 'foo bar',
      name: 'foo',
      path: shellPath,
      type: 'stdio'
    });
  });

  it('should create manifest', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const spyWrite = sinon.spy(fsPromise, 'writeFile');
    const dir = path.join(TMPDIR, 'webextnativemsg');
    const configDir =
      await createDirectory(path.join(dir, 'config', 'chrome'));
    const shellPath =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'chrome',
      hostDescription: 'foo bar',
      hostName: 'foo',
      chromeExtensionIds: ['chrome-extension://foo']
    });
    const res = await setup._createManifest(shellPath, configDir);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: writeCalled } = spyWrite;
    stubInfo.restore();
    spyWrite.restore();
    let manifestPath;
    if (IS_WIN) {
      manifestPath = path.join(configDir, 'foo.json');
    } else if (IS_MAC) {
      manifestPath = path.join(os.homedir(), 'Library', 'Application Support',
        'Google', 'Chrome', 'NativeMessagingHosts', 'foo.json');
    } else {
      manifestPath = path.join(os.homedir(), '.config', 'google-chrome',
        'NativeMessagingHosts', 'foo.json');
    }
    const file = fs.readFileSync(manifestPath, {
      encoding: 'utf8',
      flag: 'r'
    });
    const parsedFile = JSON.parse(file);
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(writeCalled, true);
    assert.strictEqual(info, `Created: ${manifestPath}`);
    assert.strictEqual(res, manifestPath);
    assert.strictEqual(isFile(manifestPath), true);
    assert.strictEqual(file.endsWith('\n'), true);
    assert.deepEqual(parsedFile, {
      allowed_origins: ['chrome-extension://foo'],
      description: 'foo bar',
      name: 'foo',
      path: shellPath,
      type: 'stdio'
    });
  });
});

describe('_createShellScript', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._createShellScript().catch(e => {
      assert.deepStrictEqual(e, new Error('No such directory: undefined.'));
    });
  });

  it('should throw', async () => {
    const dir = path.resolve(DIR_CWD, 'foo');
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.deepStrictEqual(e, new Error(`No such directory: ${dir}.`));
    });
  });

  it('should throw', async () => {
    const dir = await createDirectory(path.join(TMPDIR, 'webextnativemsg'));
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
  });

  it('should create file', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const dir = path.join(TMPDIR, 'webextnativemsg');
    const configPath = await createDirectory(path.join(dir, 'config'));
    const shellPath = path.join(configPath, IS_WIN ? 'foo.cmd' : 'foo.sh');
    const mainScriptFile = 'test/file/test.js';
    const mainFilePath = path.resolve(mainScriptFile);
    const setup = new Setup({
      mainScriptFile,
      hostName: 'foo'
    });
    const res = await setup._createShellScript(configPath);
    const { calledOnce: infoCalled } = stubInfo;
    stubInfo.restore();
    const file = fs.readFileSync(shellPath, {
      encoding: 'utf8',
      flag: 'r'
    });
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.strictEqual(isFile(shellPath), true);
    assert.strictEqual(file.endsWith('\n'), true);
    const shellEnv = process.env.SHELL || '/bin/sh';
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${shellEnv}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    }
  });

  it('should create file', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const dir = path.join(TMPDIR, 'webextnativemsg');
    const configPath = await createDirectory(path.join(dir, 'config'));
    const shellPath = path.join(configPath, IS_WIN ? 'foo.cmd' : 'foo.sh');
    const mainScriptFile = path.resolve('test/file/test_no-exist.js');
    const setup = new Setup({
      mainScriptFile,
      hostName: 'foo'
    });
    const res = await setup._createShellScript(configPath);
    const { calledOnce: infoCalled } = stubInfo;
    stubInfo.restore();
    const file = fs.readFileSync(shellPath, {
      encoding: 'utf8',
      flag: 'r'
    });
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.strictEqual(isFile(shellPath), true);
    assert.strictEqual(file.endsWith('\n'), true);
    const shellEnv = process.env.SHELL || '/bin/sh';
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${shellEnv}\n${quoteArg(process.execPath)}\n`
      );
    }
  });
});

describe('_createConfigDir', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._createConfigDir().catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
  });

  it('should create dir', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const dir = path.join(TMPDIR, 'webextnativemsg');
    const browserConfigDir = path.join(dir, 'config', 'firefox');
    const setup = new Setup();
    setup.browser = 'firefox';
    setup.configPath = path.join(dir, 'config');
    const res = await setup._createConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    stubInfo.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(info, `Created: ${browserConfigDir}`);
    assert.strictEqual(res, browserConfigDir);
    assert.strictEqual(isDir(res), true);
  });
});

describe('_createFiles', () => {
  it('should throw if failed to create files', async () => {
    const setup = new Setup();
    const configDir = path.resolve('test', 'file', 'config', 'chrome');
    // Mocks that simulate failure logic by omitting path creation mock
    sinon.stub(setup, '_createConfigDir').resolves(configDir);
    sinon.stub(setup, '_createShellScript').resolves('invalid_path');
    sinon.stub(setup, '_createManifest').resolves('invalid_path');
    await setup._createFiles().catch(e => {
      assert.deepStrictEqual(e, new Error('Failed to create files.'));
    });
  });

  it('should call callback and return paths', async () => {
    const stubCallback = sinon.stub().callsFake(arg => arg);
    const setup = new Setup({
      callback: stubCallback
    });
    const configDir = path.resolve('test', 'file', 'config', 'firefox');
    const shellPath = path.join(configDir, IS_WIN ? 'test.cmd' : 'test.sh');
    const manifestPath = path.join(configDir, 'test.json');
    // Simulate files actually existing for `isFile` checks
    const stubIsDir = sinon.stub(fs, 'statSync').returns({
      isDirectory: () => true,
      isFile: () => true,
      mode: 0
    });
    const stubConfig =
      sinon.stub(setup, '_createConfigDir').resolves(configDir);
    const stubShell =
      sinon.stub(setup, '_createShellScript').resolves(shellPath);
    const stubManifest =
      sinon.stub(setup, '_createManifest').resolves(manifestPath);
    const stubReg = sinon.stub(setup, '_createReg').resolves(true);
    const res = await setup._createFiles();
    assert.strictEqual(stubConfig.calledOnce, true);
    assert.strictEqual(stubShell.calledOnce, true);
    assert.strictEqual(stubManifest.calledOnce, true);
    assert.strictEqual(stubCallback.calledOnce, true);
    if (IS_WIN) {
      assert.strictEqual(stubReg.calledOnce, true);
    } else {
      assert.strictEqual(stubReg.called, false);
    }
    assert.deepEqual(res, {
      manifestPath,
      configDirPath: configDir,
      shellScriptPath: shellPath
    });
    stubIsDir.restore();
  });
});

describe('_handleBrowserConfigDir', () => {
  it('should throw on rejected overwrite', async () => {
    const setup = new Setup({
      overwriteConfig: false
    });
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(false);
    // Override _getBrowserConfigDir to return a directory that "exists"
    sinon.stub(setup, '_getBrowserConfigDir').returns(DIR_CWD);
    setup.browser = 'firefox';
    await setup._handleBrowserConfigDir().catch(e => {
      assert.deepStrictEqual(e, new Error(`${DIR_CWD} already exists.`));
    });
    stubConfirm.restore();
  });

  it('should call _createFiles if overwrite is true', async () => {
    const setup = new Setup({
      overwriteConfig: true
    });
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves(true);
    sinon.stub(setup, '_getBrowserConfigDir').returns(DIR_CWD);
    setup.browser = 'firefox';
    const res = await setup._handleBrowserConfigDir();
    assert.strictEqual(stubCreateFiles.calledOnce, true);
    assert.strictEqual(res, true);
  });

  it('should call _createFiles if user confirms overwrite', async () => {
    const setup = new Setup({
      overwriteConfig: false
    });
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(true);
    sinon.stub(setup, '_getBrowserConfigDir').returns(DIR_CWD);
    setup.browser = 'firefox';
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves('mock_result');
    const res = await setup._handleBrowserConfigDir();
    assert.strictEqual(stubConfirm.calledOnce, true);
    assert.strictEqual(stubCreateFiles.calledOnce, true);
    assert.strictEqual(res, 'mock_result');
    stubConfirm.restore();
  });
});

describe('_handleBrowserInput', () => {
  it('should throw if empty', async () => {
    const setup = new Setup();
    await setup._handleBrowserInput().catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected Array but got Undefined.'));
    });
  });

  it('should throw if cancelled', async () => {
    const setup = new Setup();
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => null);
    await setup._handleBrowserInput([]).catch(e => {
      assert.deepStrictEqual(e, new Error('Browser is not specified.'));
    });
    stubSelect.restore();
  });

  it('should call _handleBrowserConfigDir on valid selection', async () => {
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => 'firefox');
    const res = await setup._handleBrowserInput(['firefox', 'chrome']);
    assert.strictEqual(stubConfigDir.calledOnce, true);
    assert.strictEqual(res, true);
    assert.strictEqual(setup.browser, 'firefox');
    stubSelect.restore();
  });

  it('should set pageSize if array length is greater than 5', async () => {
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const browsers = [
      'firefox', 'chrome', 'edge', 'brave', 'opera', 'vivaldi'
    ];
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => 'firefox');
    await setup._handleBrowserInput(browsers);
    assert.strictEqual(stubSelect.calledOnce, true);
    const opt = stubSelect.getCall(0).args[0];
    assert.strictEqual(opt.pageSize, 8);
    stubConfigDir.restore();
    stubSelect.restore();
  });
});

describe('run', () => {
  it('should call browser input if no config dir', async () => {
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    assert.strictEqual(stubConfigDir.called, false);
    assert.strictEqual(stubBrowserInput.calledOnce, true);
    assert.deepEqual(res, []);
  });

  it('should skip browser input if browser is already set', async () => {
    const setup = new Setup({
      browser: 'firefox',
      webExtensionIds: ['foo@bar'],
      chromeExtensionIds: ['chrome-extension://foo']
    });
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    assert.strictEqual(stubConfigDir.calledOnce, true);
    assert.strictEqual(stubBrowserInput.called, false);
    assert.strictEqual(res, true);
  });

  it('should populate array with supported and compatible browsers', async () => {
    const setup = new Setup({
      supportedBrowsers: ['firefox', 'chrome', 'opera'],
      webExtensionIds: ['foo@bar'],
      chromeExtensionIds: ['chrome-extension://foo']
    });
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    let expected = [];
    if (IS_WIN || IS_MAC) {
      expected = ['firefox', 'chrome', 'opera'];
    } else {
      expected = ['firefox', 'chrome'];
    }
    assert.deepEqual(res, expected);
    stubBrowserInput.restore();
  });
});
