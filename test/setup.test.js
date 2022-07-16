/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createDirectory, isDir, isFile } from '../modules/file-util.js';
import { quoteArg } from '../modules/common.js';
import childProcess from 'child_process';
import fs, { promises as fsPromise } from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import readline from 'readline-sync';
import sinon from 'sinon';
import {
  DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME, IS_MAC, IS_WIN
} from '../modules/constant.js';

/* test */
import {
  Setup,
  abortSetup, getBrowserData, handleRegClose, handleRegStderr,
  handleSetupCallback, values
} from '../modules/setup.js';

/* constant */
const DIR_CONFIG = (IS_WIN && DIR_CONFIG_WIN) || (IS_MAC && DIR_CONFIG_MAC) ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const TMPDIR = path.join(DIR_CWD, 'tmp');

beforeEach(async () => {
  values.clear();
  await fsPromise.rm(TMPDIR, {
    force: true,
    recursive: true
  });
});
afterEach(async () => {
  values.clear();
  await fsPromise.rm(TMPDIR, {
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
    abortSetup('foo');
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(info, 'Setup aborted: foo');
  });
});

describe('handleSetupCallback', () => {
  it('should get null', () => {
    const res = handleSetupCallback();
    assert.isNull(res);
  });

  it('should get null', () => {
    values.set('configDir', 'foo');
    values.set('shellPath', 'bar');
    values.set('manifestPath', 'baz');
    values.set('callback', {});
    const res = handleSetupCallback();
    assert.isNull(res);
  });

  it('should call function', () => {
    const stubFunc = sinon.stub().callsFake(a => a);
    values.set('configDir', 'foo');
    values.set('shellPath', 'bar');
    values.set('manifestPath', 'baz');
    values.set('callback', stubFunc);
    const res = handleSetupCallback();
    assert.isTrue(stubFunc.calledOnce);
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
      assert.isTrue(infoCalled);
      assert.isTrue(exitCalled);
      assert.strictEqual(info, `Setup aborted: ${reg} exited with 1.`);
      assert.isFalse(stubFunc.called);
    } else {
      assert.isFalse(infoCalled);
      assert.isFalse(exitCalled);
      assert.isUndefined(info);
      assert.isFalse(stubFunc.called);
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
      assert.isTrue(infoCalled);
      assert.isFalse(exitCalled);
      assert.strictEqual(info, `Created: ${regKey}`);
      assert.isTrue(stubFunc.calledOnce);
    } else {
      assert.isFalse(infoCalled);
      assert.isFalse(exitCalled);
      assert.isUndefined(info);
      assert.isFalse(stubFunc.called);
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
      assert.isTrue(errCalled);
      assert.strictEqual(err, 'stderr: foo');
      assert.isTrue(infoCalled);
      assert.strictEqual(info, 'Setup aborted: Failed to create registry key.');
      assert.isTrue(exitCalled);
    } else {
      assert.isFalse(errCalled);
      assert.isUndefined(err);
      assert.isFalse(infoCalled);
      assert.isUndefined(info);
      assert.isFalse(exitCalled);
    }
  });
});

describe('getBrowserData', () => {
  it('should get object if key matches', () => {
    assert.isObject(getBrowserData('firefox'));
  });

  it('should get object if key matches', () => {
    assert.isObject(getBrowserData('chrome'));
  });

  it('should get null if no argument given', () => {
    assert.isNull(getBrowserData());
  });

  it('should get null if key does not match', () => {
    assert.isNull(getBrowserData('foo'));
  });
});

describe('Setup', () => {
  it('should create an instance', () => {
    const setup = new Setup();
    assert.instanceOf(setup, Setup);
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
      assert.isFunction(setup.callback);
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
      assert.isNull(setup.browser);
    });

    it('should get object', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      assert.deepEqual(setup.browser, 'firefox');
    });

    it('should get array', () => {
      const setup = new Setup();
      assert.isArray(setup.supportedBrowsers);
    });

    it('should get string', () => {
      const setup = new Setup({
        hostName: 'myhost'
      });
      assert.strictEqual(setup.configPath,
        path.resolve(DIR_CONFIG, 'myhost', 'config'));
    });

    it('should get string', () => {
      const setup = new Setup();
      assert.strictEqual(setup.configPath,
        path.resolve(DIR_CWD, 'config'));
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.isNull(setup.hostDescription);
    });

    it('should get string', () => {
      const setup = new Setup({
        hostDescription: 'My host description'
      });
      assert.strictEqual(setup.hostDescription, 'My host description');
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.isNull(setup.hostName);
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
      assert.isNull(setup.chromeExtensionIds);
    });

    it('should get array', () => {
      const setup = new Setup({
        chromeExtensionIds: ['chrome-extension://foo']
      });
      assert.deepEqual(setup.chromeExtensionIds, ['chrome-extension://foo']);
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.isNull(setup.webExtensionIds);
    });

    it('should get array', () => {
      const setup = new Setup({
        webExtensionIds: ['foo@bar']
      });
      assert.deepEqual(setup.webExtensionIds, ['foo@bar']);
    });

    it('should get null', () => {
      const setup = new Setup();
      assert.isNull(setup.callback);
    });

    it('should get function', () => {
      const setup = new Setup({
        callback: a => a
      });
      assert.isFunction(setup.callback);
    });

    it('should get false', () => {
      const setup = new Setup();
      assert.isFalse(setup.overwriteConfig);
    });

    it('should get false', () => {
      const setup = new Setup({
        overwriteConfig: false
      });
      assert.isFalse(setup.overwriteConfig);
    });

    it('should get true', () => {
      const setup = new Setup({
        overwriteConfig: true
      });
      assert.isTrue(setup.overwriteConfig);
    });
  });

  describe('setters', () => {
    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = '';
      assert.isNull(setup.browser);
    });

    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = 'foo';
      assert.isNull(setup.browser);
    });

    it('should set null', () => {
      const setup = new Setup({
        browser: 'firefox'
      });
      setup.browser = 1;
      assert.isNull(setup.browser);
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
        () => { setup.configPath = myPath; },
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

    it('should set null', () => {
      const setup = new Setup({
        hostDescription: 'My host description'
      });
      setup.hostDescription = 1;
      assert.isNull(setup.hostDescription);
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
      assert.isNull(setup.hostName);
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
      assert.isNull(setup.chromeExtensionIds);
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
      assert.isNull(setup.webExtensionIds);
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
      assert.isNull(setup.callback);
    });

    it('should set function', () => {
      const myCallback = a => a;
      const setup = new Setup();
      setup.callback = myCallback;
      assert.isFunction(setup.callback);
      assert.strictEqual(setup.callback.name, 'myCallback');
    });

    it('should set true', () => {
      const setup = new Setup();
      setup.overwriteConfig = true;
      assert.isTrue(setup.overwriteConfig);
    });

    it('should set false', () => {
      const setup = new Setup({
        overwriteConfig: true
      });
      setup.overwriteConfig = false;
      assert.isFalse(setup.overwriteConfig);
    });
  });
});

describe('_getConfigDir', () => {
  it("should throw if dir is not subdirectory of user's home dir", () => {
    const setup = new Setup();
    assert.throws(
      () => setup._getConfigDir({
        configPath: '/foo/bar'
      }),
      `${path.normalize('/foo/bar')} is not sub directory of ${DIR_HOME}.`
    );
  });

  it("should throw if dir is not subdirectory of user's home dir", () => {
    const setup = new Setup();
    assert.throws(
      () => setup._getConfigDir({
        configPath: path.join(DIR_HOME, '../foo')
      }),
      `${path.join(DIR_HOME, '../foo')} is not sub directory of ${DIR_HOME}.`);
  });

  it('should get dir', () => {
    const configPath = path.join('foo', 'bar');
    const setup = new Setup();
    const res = setup._getConfigDir({ configPath });
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join('foo', '../bar/baz');
    const setup = new Setup();
    const res = setup._getConfigDir({ configPath });
    assert.strictEqual(configPath, path.join('bar', 'baz'));
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join(DIR_CONFIG, 'foo', 'config');
    const setup = new Setup();
    const res = setup._getConfigDir({
      hostName: 'foo'
    });
    assert.strictEqual(res, path.resolve(configPath));
  });

  it('should get dir', () => {
    const configPath = path.join(DIR_CWD, 'config');
    const setup = new Setup();
    const res = setup._getConfigDir();
    assert.strictEqual(res, path.resolve(configPath));
  });
});

describe('_getBrowserConfigDir', () => {
  it('should get null', () => {
    const browser = IS_WIN ? 'Chromium' : 'CentBrowser';
    const setup = new Setup({
      browser
    });
    const res = setup._getBrowserConfigDir();
    assert.isNull(res);
  });

  it('should get string', () => {
    const setup = new Setup({
      browser: 'firefox'
    });
    const res = setup._getBrowserConfigDir();
    assert.isString(res);
  });
});

describe('_createReg', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._createReg().catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, 'No such file: undefined.');
    });
  });

  it('should throw', async () => {
    const manifestPath =
      path.resolve('test', 'file', 'config', 'firefox', 'test.json');
    const setup = new Setup();
    await setup._createReg(manifestPath).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected Object but got Null.');
    });
  });

  it('should throw', async () => {
    const manifestPath =
      path.resolve(path.join('test', 'file', 'config', 'firefox', 'test.json'));
    const setup = new Setup({
      browser: 'firefox'
    });
    await setup._createReg(manifestPath).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
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
      assert.isObject(res);
      assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'on'));
      assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'stderr'));
      assert.isTrue(Object.prototype.hasOwnProperty.call(res.stderr, 'on'));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.isNull(res);
    }
    stubSpawn.restore();
  });
});

describe('_createManifest', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._createManifest().catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, 'No such file: undefined.');
    });
  });

  it('should throw', async () => {
    const file = path.resolve(DIR_CWD, IS_WIN ? 'foo.cmd' : 'foo.sh');
    const setup = new Setup();
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, `No such file: ${file}.`);
    });
  });

  it('should throw', async () => {
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup();
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected Object but got Null.');
    });
  });

  it('should throw', async () => {
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox'
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
    });
  });

  it('should throw', async () => {
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar'
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
    });
  });

  it('should throw', async () => {
    const file =
      path.resolve(DIR_CWD, 'test', 'file', IS_WIN ? 'test.cmd' : 'test.sh');
    const setup = new Setup({
      browser: 'firefox',
      hostDescription: 'foo bar',
      hostName: 'foo'
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected Array but got Null.');
    });
  });

  it('should throw', async () => {
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
        assert.instanceOf(e, Error);
        assert.strictEqual(e.message, 'No such directory: undefined.');
      });
    }
  });

  it('should throw', async () => {
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
        assert.instanceOf(e, Error);
        assert.strictEqual(e.message, 'No such directory: undefined.');
      });
    }
  });

  it('should throw', async () => {
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
        assert.instanceOf(e, Error);
        assert.strictEqual(e.message, `No such directory: ${dir}.`);
      });
    }
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
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(mkdirCallCount, 0);
    } else {
      assert.strictEqual(mkdirCallCount, 1);
    }
    assert.isTrue(writeCalled);
    assert.strictEqual(info, `Created: ${manifestPath}`);
    assert.strictEqual(res, manifestPath);
    assert.isTrue(isFile(manifestPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.isTrue(writeCalled);
    assert.strictEqual(info, `Created: ${manifestPath}`);
    assert.strictEqual(res, manifestPath);
    assert.isTrue(isFile(manifestPath));
    assert.isTrue(file.endsWith('\n'));
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
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, 'No such directory: undefined.');
    });
  });

  it('should throw', async () => {
    const dir = path.resolve(DIR_CWD, 'foo');
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, `No such directory: ${dir}.`);
    });
  });

  it('should throw', async () => {
    const dir = await createDirectory(path.join(TMPDIR, 'webextnativemsg'));
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith('\n'));
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
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
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
    assert.isTrue(infoCalled);
    assert.strictEqual(info, `Created: ${browserConfigDir}`);
    assert.strictEqual(res, browserConfigDir);
    assert.isTrue(isDir(res));
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
    assert.isTrue(stubConfig.calledOnce);
    assert.isTrue(stubShell.calledOnce);
    assert.isTrue(stubManifest.calledOnce);
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(info, 'Setup aborted: Failed to create files.');
    assert.isFalse(stubReg.called);
    assert.isFalse(stubCallback.called);
    assert.isUndefined(res);
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
    assert.isTrue(stubConfig.calledOnce);
    assert.isTrue(stubShell.calledOnce);
    assert.isTrue(stubManifest.calledOnce);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    if (IS_WIN) {
      assert.isTrue(stubReg.calledOnce);
      assert.isFalse(stubCallback.called);
      assert.isTrue(res);
    } else {
      assert.isFalse(stubReg.called);
      assert.isTrue(stubCallback.calledOnce);
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
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected String but got Null.');
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
    const stubReadline = sinon.stub(readline, 'keyInYNStrict').returns(false);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubReadline.callCount;
    const configPath = path.resolve('test', 'file', 'config', 'firefox');
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isFalse(stubCreateFiles.calledOnce);
    assert.strictEqual(stubReadline.callCount, i + 1);
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(info, `Setup aborted: ${configPath} already exists.`);
    assert.isUndefined(res);
    stubReadline.restore();
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
    const stubReadline = sinon.stub(readline, 'keyInYNStrict').returns(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubReadline.callCount;
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(stubCreateFiles.calledOnce);
    assert.strictEqual(stubReadline.callCount, i + 1);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    assert.isTrue(res);
    stubReadline.restore();
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
    const stubReadline = sinon.stub(readline, 'keyInYNStrict').returns(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubReadline.callCount;
    setup.browser = 'firefox';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(stubCreateFiles.calledOnce);
    assert.strictEqual(stubReadline.callCount, i);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    assert.isTrue(res);
    stubReadline.restore();
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
    const stubReadline = sinon.stub(readline, 'keyInYNStrict').returns(true);
    const stubExit = sinon.stub(process, 'exit');
    const i = stubReadline.callCount;
    setup.browser = 'chrome';
    setup.configPath = path.resolve('test', 'file', 'config');
    const res = await setup._handleBrowserConfigDir();
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(stubCreateFiles.calledOnce);
    assert.strictEqual(stubReadline.callCount, i);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    assert.isTrue(res);
    stubReadline.restore();
  });
});

describe('_handleBrowserInput', () => {
  it('should throw', async () => {
    const setup = new Setup();
    await setup._handleBrowserInput().catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected Array but got Undefined.');
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
    const stubReadline =
      sinon.stub(readline, 'keyInSelect').callsFake(() => -1);
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput([]);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubReadline.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.isFalse(stubConfigDir.called);
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(info, 'Setup aborted: Browser is not specified.');
    assert.isUndefined(res);
  });

  it('should call function', async () => {
    let info;
    const stubInfo = sinon.stub(console, 'info').callsFake(arg => {
      info = arg;
    });
    const setup = new Setup();
    const stubConfigDir =
      sinon.stub(setup, '_handleBrowserConfigDir').resolves(true);
    const stubReadline = sinon.stub(readline, 'keyInSelect').callsFake(() => 0);
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput(['firefox', 'chrome']);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubReadline.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(stubConfigDir.calledOnce);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    assert.isTrue(res);
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
    const stubReadline = sinon.stub(readline, 'keyInSelect').callsFake(() => 1);
    const stubExit = sinon.stub(process, 'exit');
    const res = await setup._handleBrowserInput(['firefox', 'chrome']);
    const { calledOnce: infoCalled } = stubInfo;
    const { calledOnce: exitCalled } = stubExit;
    stubReadline.restore();
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(stubConfigDir.calledOnce);
    assert.isFalse(infoCalled);
    assert.isFalse(exitCalled);
    assert.isUndefined(info);
    assert.isTrue(res);
    assert.strictEqual(setup.browser, 'chrome');
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
    assert.isFalse(stubConfigDir.called);
    assert.isTrue(stubBrowserInput.calledOnce);
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
    assert.isFalse(stubConfigDir.called);
    assert.isTrue(stubBrowserInput.calledOnce);
    assert.isTrue(res.includes('firefox'));
    assert.isTrue(res.includes('chrome'));
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
    assert.isFalse(stubConfigDir.called);
    assert.isTrue(stubBrowserInput.calledOnce);
    assert.isTrue(res.includes('firefox'));
    assert.isFalse(res.includes('chrome'));
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
    assert.isFalse(stubConfigDir.called);
    assert.isTrue(stubBrowserInput.calledOnce);
    assert.isFalse(res.includes('firefox'));
    assert.isTrue(res.includes('chrome'));
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
    assert.isTrue(stubConfigDir.calledOnce);
    assert.isFalse(stubBrowserInput.called);
    assert.isTrue(res);
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
    assert.isTrue(stubConfigDir.calledOnce);
    assert.isFalse(stubBrowserInput.called);
    assert.isTrue(res);
  });
});
