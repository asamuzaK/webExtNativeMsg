/* api */
import { strict as assert } from 'node:assert';
import childProcess from 'node:child_process';
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
  Setup, abortSetup, getBrowserData, getConfigDir, handlePromptError,
  handleRegClose, handleRegStderr, handleSetupCallback, inquirer, values
} from '../modules/setup.js';

/* constant */
const DIR_CONFIG = (IS_WIN && DIR_CONFIG_WIN) || (IS_MAC && DIR_CONFIG_MAC) ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const TMPDIR = path.join(DIR_CWD, 'tmp');

beforeEach(() => {
  values.clear();
  fs.rmSync(TMPDIR, {
    force: true,
    recursive: true
  });
});
afterEach(() => {
  values.clear();
  fs.rmSync(TMPDIR, {
    force: true,
    recursive: true
  });
});

describe('abortSetup', () => {
  it('should exit with message', () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const i = stubExit.withArgs(1).callCount;
    abortSetup('foo');
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: exitCallCount } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCallCount, i + 1);
    assert.strictEqual(info, 'Setup aborted: foo');
  });

  it('should exit with message', () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const i = stubExit.withArgs(2).callCount;
    abortSetup('foo', 2);
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: exitCallCount } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCallCount, i + 1);
    assert.strictEqual(info, 'Setup aborted: foo');
  });
});

describe('handlePromptError', () => {
  it('should exit with unknown error message', () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const i = stubExit.withArgs(1).callCount;
    handlePromptError('foo');
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: exitCallCount } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCallCount, i + 1);
    assert.strictEqual(info, 'Setup aborted: Unknown error.');
  });

  it('should exit with message', () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const i = stubExit.withArgs(1).callCount;
    handlePromptError(new Error('foo'));
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: exitCallCount } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCallCount, i + 1);
    assert.strictEqual(info, 'Setup aborted: foo');
  });

  it('should exit with message', () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const i = stubExit.withArgs(130).callCount;
    const e = new Error('foo');
    e.name = 'ExitPromptError';
    handlePromptError(e);
    const { calledOnce: infoCalled } = stubInfo;
    const { callCount: exitCallCount } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCallCount, i + 1);
    assert.strictEqual(info, 'Setup aborted: foo');
  });
});

describe('handleSetupCallback', () => {
  it('should get null', () => {
    const res = handleSetupCallback();
    assert.deepEqual(res, null);
  });

  it('should get null', () => {
    values.set('configDir', 'foo');
    values.set('shellPath', 'bar');
    values.set('manifestPath', 'baz');
    values.set('callback', {});
    const res = handleSetupCallback();
    assert.deepEqual(res, null);
  });

  it('should call function', () => {
    const stubFunc = sinon.stub().callsFake(a => a);
    values.set('configDir', 'foo');
    values.set('shellPath', 'bar');
    values.set('manifestPath', 'baz');
    values.set('callback', stubFunc);
    const res = handleSetupCallback();
    assert.strictEqual(stubFunc.calledOnce, true);
    assert.deepEqual(res, {
      configDirPath: 'foo',
      shellScriptPath: 'bar',
      manifestPath: 'baz'
    });
  });
});

describe('handleRegClose', () => {
  it('should abort', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const stubFunc = sinon.stub();
    const regKey = path.join('HKEY_CURRENT_USER', 'SOFTWARE', 'Mozilla',
      'NativeMessagingHosts', 'foo');
    values.set('regKey', regKey);
    values.set('callback', stubFunc);
    await handleRegClose(1);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    if (IS_WIN) {
      const reg = path.join(process.env.WINDIR, 'system32', 'reg.exe');
      assert.strictEqual(infoCalled, true);
      assert.strictEqual(exitCalled, true);
      assert.strictEqual(info, `Setup aborted: ${reg} exited with 1.`);
      assert.strictEqual(stubFunc.called, false);
    } else {
      assert.strictEqual(infoCalled, false);
      assert.strictEqual(exitCalled, false);
      assert.strictEqual(info, undefined);
      assert.strictEqual(stubFunc.called, false);
    }
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const stubFunc = sinon.stub();
    const regKey = path.join('HKEY_CURRENT_USER', 'SOFTWARE', 'Mozilla',
      'NativeMessagingHosts', 'foo');
    values.set('regKey', regKey);
    values.set('callback', stubFunc);
    await handleRegClose(0);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    if (IS_WIN) {
      assert.strictEqual(infoCalled, true);
      assert.strictEqual(exitCalled, false);
      assert.strictEqual(info, `Created: ${regKey}`);
      assert.strictEqual(stubFunc.calledOnce, true);
    } else {
      assert.strictEqual(infoCalled, false);
      assert.strictEqual(exitCalled, false);
      assert.strictEqual(info, undefined);
      assert.strictEqual(stubFunc.called, false);
    }
  });
});

describe('handleRegStdErr', () => {
  it('should console error', async () => {
    let err, info;
    const stubErr = sinon.stub(console, 'error').callsFake(msg => {
      err = msg;
    });
    const stubInfo = sinon.stub(console, 'info').callsFake(msg => {
      info = msg;
    });
    const stubExit = sinon.stub(process, 'exit');
    await handleRegStderr('foo');
    const { calledOnce: errCalled } = stubErr;
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubErr.restore();
    stubInfo.restore();
    stubExit.restore();
    if (IS_WIN) {
      assert.strictEqual(errCalled, true);
      assert.strictEqual(err, 'stderr: foo');
      assert.strictEqual(infoCalled, true);
      assert.strictEqual(info, 'Setup aborted: Failed to create registry key.');
      assert.strictEqual(exitCalled, true);
    } else {
      assert.strictEqual(errCalled, false);
      assert.strictEqual(err, undefined);
      assert.strictEqual(infoCalled, false);
      assert.strictEqual(info, undefined);
      assert.strictEqual(exitCalled, false);
    }
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
    const stubSpawn = sinon.stub(childProcess, 'spawn').returns({
      on: a => a,
      stderr: {
        on: a => a
      }
    });
    const i = stubSpawn.callCount;
    const setup = new Setup({
      browser: 'firefox',
      hostName: 'foo'
    });
    const res = await setup._createReg(manifestPath);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(typeof res, 'object');
      assert.strictEqual(Object.prototype.hasOwnProperty.call(res, 'on'), true);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(res, 'stderr'),
        true);
      assert.strictEqual(
        Object.prototype.hasOwnProperty.call(res.stderr, 'on'), true);
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.deepEqual(res, null);
    }
    stubSpawn.restore();
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
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
    const mainScriptFile = path.resolve('test/file/test.js');
    const mainFilePath = mainScriptFile;
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
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
    const mainScriptFile = path.resolve('test/file/test.js');
    const mainFilePath = mainScriptFile;
    const setup = new Setup({
      hostName: 'foo'
    });
    setup.mainScriptFile = mainScriptFile;
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
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
    const mainScriptFile = 'test/file/test 2.js';
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
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
    const mainScriptFile = path.resolve('test/file/test 2.js');
    const mainFilePath = mainScriptFile;
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)} ${quoteArg(mainFilePath)}\n`
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
    const mainScriptFile = 'test/file/test_no-exist.js';
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)}\n`
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
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)}\n`
      );
    } else {
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${quoteArg(process.execPath)}\n`
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
  it('should abort', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const stubCallback = sinon.stub().callsFake(arg => arg);
    const setup = new Setup({
      callback: stubCallback
    });
    const configDir = path.resolve('test', 'file', 'config', 'chrome');
    const shellPath = path.join(configDir, IS_WIN ? 'test.cmd' : 'test.sh');
    const manifestPath = path.join(configDir, 'test.json');
    const stubConfig =
      sinon.stub(setup, '_createConfigDir').resolves(configDir);
    const stubShell =
      sinon.stub(setup, '_createShellScript').resolves(shellPath);
    const stubManifest =
      sinon.stub(setup, '_createManifest').resolves(manifestPath);
    const stubReg = sinon.stub(setup, '_createReg').resolves(true);
    const res = await setup._createFiles();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfig.calledOnce, true);
    assert.strictEqual(stubShell.calledOnce, true);
    assert.strictEqual(stubManifest.calledOnce, true);
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCalled, true);
    assert.strictEqual(info, 'Setup aborted: Failed to create files.');
    assert.strictEqual(stubReg.called, false);
    assert.strictEqual(stubCallback.called, false);
    assert.strictEqual(res, undefined);
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const stubExit = sinon.stub(process, 'exit');
    const stubCallback = sinon.stub().callsFake(arg => arg);
    const setup = new Setup({
      callback: stubCallback
    });
    const configDir = path.resolve('test', 'file', 'config', 'firefox');
    const shellPath = path.join(configDir, IS_WIN ? 'test.cmd' : 'test.sh');
    const manifestPath = path.join(configDir, 'test.json');
    const stubConfig =
      sinon.stub(setup, '_createConfigDir').resolves(configDir);
    const stubShell =
      sinon.stub(setup, '_createShellScript').resolves(shellPath);
    const stubManifest =
      sinon.stub(setup, '_createManifest').resolves(manifestPath);
    const stubReg = sinon.stub(setup, '_createReg').resolves(true);
    const res = await setup._createFiles();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfig.calledOnce, true);
    assert.strictEqual(stubShell.calledOnce, true);
    assert.strictEqual(stubManifest.calledOnce, true);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    if (IS_WIN) {
      assert.strictEqual(stubReg.calledOnce, true);
      assert.strictEqual(stubCallback.called, false);
      assert.strictEqual(res, true);
    } else {
      assert.strictEqual(stubReg.called, false);
      assert.strictEqual(stubCallback.calledOnce, true);
      assert.deepEqual(res, {
        manifestPath,
        configDirPath: configDir,
        shellScriptPath: shellPath
      });
    }
  });
});

describe('_handleBrowserConfigDir', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._handleBrowserConfigDir().catch(e => {
      assert.deepStrictEqual(e, new TypeError('Expected String but got Null.'));
    });
  });

  it('should abort', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup({
      overwriteConfig: false
    });
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves(true);
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(false);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubConfirm.callCount;
    const configPath = path.resolve('test', 'file', 'config', 'firefox');
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubCreateFiles.called, false);
    assert.strictEqual(stubConfirm.callCount, i + 1);
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCalled, true);
    assert.strictEqual(info, `Setup aborted: ${configPath} already exists.`);
    assert.strictEqual(res, undefined);
    stubConfirm.restore();
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup({
      overwriteConfig: false
    });
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves(true);
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubConfirm.callCount;
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubCreateFiles.calledOnce, true);
    assert.strictEqual(stubConfirm.callCount, i + 1);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    stubConfirm.restore();
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup({
      overwriteConfig: true
    });
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves(true);
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubConfirm.callCount;
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubCreateFiles.calledOnce, true);
    assert.strictEqual(stubConfirm.callCount, i);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    stubConfirm.restore();
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup({
      overwriteConfig: false
    });
    const stubCreateFiles = sinon.stub(setup, '_createFiles').resolves(true);
    const stubConfirm = sinon.stub(inquirer, 'confirm').resolves(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubConfirm.callCount;
    setup.browser = 'chrome';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubCreateFiles.calledOnce, true);
    assert.strictEqual(stubConfirm.callCount, i);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    stubConfirm.restore();
  });
});

describe('_handleBrowserInput', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._handleBrowserInput().catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected Array but got Undefined.'));
    });
  });

  it('should abort', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => null);
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput([]);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubSelect.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfigDir.called, false);
    assert.strictEqual(infoCalled, true);
    assert.strictEqual(exitCalled, true);
    assert.strictEqual(info, 'Setup aborted: Browser is not specified.');
    assert.strictEqual(res, undefined);
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => 'firefox');
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput(['firefox', 'chrome']);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubSelect.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfigDir.calledOnce, true);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    assert.strictEqual(setup.browser, 'firefox');
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => 'chrome');
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput(['firefox', 'chrome']);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubSelect.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfigDir.calledOnce, true);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    assert.strictEqual(setup.browser, 'chrome');
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubSelect =
      sinon.stub(inquirer, 'select').callsFake(async () => 'vivaldi');
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput([
      'firefox',
      'thunderbird',
      'chrome',
      'brave',
      'edge',
      'vivaldi'
    ]);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubSelect.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.strictEqual(stubConfigDir.calledOnce, true);
    assert.strictEqual(infoCalled, false);
    assert.strictEqual(exitCalled, false);
    assert.strictEqual(info, undefined);
    assert.strictEqual(res, true);
    assert.strictEqual(setup.browser, 'vivaldi');
  });
});

describe('run', () => {
  it('should call function', async () => {
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

  it('should call function', async () => {
    const setup = new Setup({
      webExtensionIds: ['foo@bar'],
      chromeExtensionIds: ['chrome-extension://foo']
    });
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    assert.strictEqual(stubConfigDir.called, false);
    assert.strictEqual(stubBrowserInput.calledOnce, true);
    assert.strictEqual(res.includes('firefox'), true);
    assert.strictEqual(res.includes('chrome'), true);
  });

  it('should call function', async () => {
    const setup = new Setup({
      webExtensionIds: ['foo@bar']
    });
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    assert.strictEqual(stubConfigDir.called, false);
    assert.strictEqual(stubBrowserInput.calledOnce, true);
    assert.strictEqual(res.includes('firefox'), true);
    assert.strictEqual(res.includes('chrome'), false);
  });

  it('should call function', async () => {
    const setup = new Setup({
      chromeExtensionIds: ['chrome-extension://foo']
    });
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubBrowserInput =
      sinon.stub(setup, '_handleBrowserInput').callsFake(async arg => arg);
    const res = await setup.run();
    assert.strictEqual(stubConfigDir.called, false);
    assert.strictEqual(stubBrowserInput.calledOnce, true);
    assert.strictEqual(res.includes('firefox'), false);
    assert.strictEqual(res.includes('chrome'), true);
  });

  it('should call function', async () => {
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

  it('should call function', async () => {
    const setup = new Setup({
      browser: 'chrome',
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
});
