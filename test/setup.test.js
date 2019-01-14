/* eslint-disable camelcase */
"use strict";
/* api */
const {
  Setup,
  abortSetup, getBrowserData, handleRegStderr,
} = require("../modules/setup");
const {
  createDirectory, isDir, isFile, removeDir,
} = require("../modules/file-util");
const {quoteArg} = require("../modules/common");
const {assert} = require("chai");
const {describe, it} = require("mocha");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const process = require("process");
const readline = require("readline");
const sinon = require("sinon");

/* constant */
const {
  DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME, IS_MAC, IS_WIN,
} = require("../modules/constant");
const DIR_CONFIG = IS_WIN && DIR_CONFIG_WIN || IS_MAC && DIR_CONFIG_MAC ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe("abortSetup", () => {
  it("should exit with message", () => {
    let info;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      info = msg;
    });
    abortSetup("foo");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(info, "Setup aborted: foo");
  });
});

describe("getBrowserData", () => {
  it("should get object if key matches", () => {
    assert.isObject(getBrowserData("firefox"));
  });

  it("should get object if key matches", () => {
    assert.isObject(getBrowserData("chrome"));
  });

  it("should get null if no argument given", () => {
    assert.isNull(getBrowserData());
  });

  it("should get null if key does not match", () => {
    assert.isNull(getBrowserData("foo"));
  });
});

describe("handleRegStdErr", () => {
  if (IS_WIN) {
    it("should console error", () => {
      let err;
      const data = "foo";
      const stubErr = sinon.stub(console, "error").callsFake(msg => {
        err = msg;
      });
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      handleRegStderr(data);
      stubErr.restore();
      assert.strictEqual(err, `stderr: ${reg}: ${data}`);
    });
  }
});

describe("Setup", () => {
  it("should create an instance", () => {
    const setup = new Setup();
    assert.instanceOf(setup, Setup);
  });

  describe("constructor", () => {
    it("should set browser", () => {
      const browser = "firefox";
      const setup = new Setup({
        browser,
      });
      assert.strictEqual(setup.browser, browser);
    });

    it("should set configPath", () => {
      const configPath = path.join("test", "file", "config");
      const setup = new Setup({
        configPath,
      });
      assert.strictEqual(setup.configPath, path.resolve(configPath));
    });

    it("should set hostDescription", () => {
      const hostDescription = "foo bar";
      const setup = new Setup({
        hostDescription,
      });
      assert.strictEqual(setup.hostDescription, hostDescription);
    });

    it("should set hostName", () => {
      const hostName = "foo";
      const setup = new Setup({
        hostName,
      });
      assert.strictEqual(setup.hostName, hostName);
    });

    it("should set mainScriptFile", () => {
      const mainScriptFile = "foo.js";
      const setup = new Setup({
        mainScriptFile,
      });
      assert.strictEqual(setup.mainScriptFile, mainScriptFile);
    });

    it("should set chromeExtensionIds", () => {
      const chromeExtensionIds = ["chrome-extension://foo"];
      const setup = new Setup({
        chromeExtensionIds,
      });
      assert.deepEqual(setup.chromeExtensionIds, chromeExtensionIds);
    });

    it("should set webExtensionIds", () => {
      const webExtensionIds = ["foo@bar"];
      const setup = new Setup({
        webExtensionIds,
      });
      assert.deepEqual(setup.webExtensionIds, webExtensionIds);
    });

    it("should set callback", () => {
      const myCallback = a => a;
      const setup = new Setup({
        callback: myCallback,
      });
      assert.isFunction(setup.callback);
      assert.strictEqual(setup.callback.name, "myCallback");
    });

    it("should set overwriteConfig", () => {
      const overwriteConfig = true;
      const setup = new Setup({
        overwriteConfig,
      });
      assert.strictEqual(setup.overwriteConfig, !!overwriteConfig);
    });

    it("should set overwriteConfig", () => {
      const overwriteConfig = false;
      const setup = new Setup({
        overwriteConfig,
      });
      assert.strictEqual(setup.overwriteConfig, !!overwriteConfig);
    });
  });

  describe("getters", () => {
    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.browser);
    });

    it("should get object", () => {
      const setup = new Setup({
        browser: "firefox",
      });
      assert.deepEqual(setup.browser, "firefox");
    });

    it("should get string", () => {
      const setup = new Setup({
        hostName: "myhost",
      });
      assert.strictEqual(setup.configPath,
                         path.join(DIR_CONFIG, "myhost", "config"));
    });

    it("should get string", () => {
      const setup = new Setup();
      assert.strictEqual(setup.configPath,
                         path.join(DIR_CWD, "config"));
    });

    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.hostDescription);
    });

    it("should get string", () => {
      const setup = new Setup({
        hostDescription: "My host description",
      });
      assert.strictEqual(setup.hostDescription, "My host description");
    });

    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.hostName);
    });

    it("should get string", () => {
      const setup = new Setup({
        hostName: "myhost",
      });
      assert.strictEqual(setup.hostName, "myhost");
    });

    it("should get string", () => {
      const setup = new Setup({
        mainScriptFile: "main.js",
      });
      assert.strictEqual(setup.mainScriptFile, "main.js");
    });

    it("should get string", () => {
      const setup = new Setup();
      assert.strictEqual(setup.mainScriptFile, "index.js");
    });

    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.chromeExtensionIds);
    });

    it("should get array", () => {
      const setup = new Setup({
        chromeExtensionIds: ["chrome-extension://foo"],
      });
      assert.deepEqual(setup.chromeExtensionIds, ["chrome-extension://foo"]);
    });

    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.webExtensionIds);
    });

    it("should get array", () => {
      const setup = new Setup({
        webExtensionIds: ["foo@bar"],
      });
      assert.deepEqual(setup.webExtensionIds, ["foo@bar"]);
    });

    it("should get null", () => {
      const setup = new Setup();
      assert.isNull(setup.callback);
    });

    it("should get function", () => {
      const setup = new Setup({
        callback: a => a,
      });
      assert.isFunction(setup.callback);
    });

    it("should get false", () => {
      const setup = new Setup();
      assert.isFalse(setup.overwriteConfig);
    });

    it("should get false", () => {
      const setup = new Setup({
        overwriteConfig: false,
      });
      assert.isFalse(setup.overwriteConfig);
    });

    it("should get true", () => {
      const setup = new Setup({
        overwriteConfig: true,
      });
      assert.isTrue(setup.overwriteConfig);
    });
  });

  describe("setters", () => {
    it("should set null", () => {
      const setup = new Setup({
        browser: "firefox",
      });
      setup.browser = "";
      assert.isNull(setup.browser);
    });

    it("should set null", () => {
      const setup = new Setup({
        browser: "firefox",
      });
      setup.browser = "foo";
      assert.isNull(setup.browser);
    });

    it("should set string", () => {
      const setup = new Setup({
        browser: "chrome",
      });
      setup.browser = "firefox";
      assert.strictEqual(setup.browser, "firefox");
    });

    it("should set string", () => {
      const myPath = path.join(DIR_CWD, "foo");
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should set string", () => {
      const myPath = path.join(DIR_CONFIG, "myhost", "config");
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should set null", () => {
      const setup = new Setup({
        hostDescription: "My host description",
      });
      setup.hostDescription = 1;
      assert.isNull(setup.hostDescription);
    });

    it("should set string", () => {
      const setup = new Setup();
      setup.hostDescription = "My host description";
      assert.strictEqual(setup.hostDescription, "My host description");
    });

    it("should set null", () => {
      const setup = new Setup({
        hostName: "myhost",
      });
      setup.hostName = 1;
      assert.isNull(setup.hostName);
    });

    it("should set string", () => {
      const setup = new Setup();
      setup.hostName = "myhost";
      assert.strictEqual(setup.hostName, "myhost");
    });

    it("should set string", () => {
      const setup = new Setup({
        mainScriptFile: "main.js",
      });
      setup.mainScriptFile = 1;
      assert.strictEqual(setup.mainScriptFile, "index.js");
    });

    it("should set string", () => {
      const setup = new Setup();
      setup.mainScriptFile = "main.js";
      assert.strictEqual(setup.mainScriptFile, "main.js");
    });

    it("should set null", () => {
      const setup = new Setup({
        chromeExtensionIds: ["chrome-extension://foo"],
      });
      setup.chromeExtensionIds = [];
      assert.isNull(setup.chromeExtensionIds);
    });

    it("should set array", () => {
      const setup = new Setup();
      setup.chromeExtensionIds = ["chrome-extension://foo"];
      assert.deepEqual(setup.chromeExtensionIds, ["chrome-extension://foo"]);
    });

    it("should set null", () => {
      const setup = new Setup({
        webExtensionIds: ["myapp@webextension"],
      });
      setup.webExtensionIds = [];
      assert.isNull(setup.webExtensionIds);
    });

    it("should set array", () => {
      const setup = new Setup();
      setup.webExtensionIds = ["myapp@webextension"];
      assert.deepEqual(setup.webExtensionIds, ["myapp@webextension"]);
    });

    it("should set null", () => {
      const myCallback = a => a;
      const setup = new Setup({
        callback: myCallback,
      });
      setup.callback = 1;
      assert.isNull(setup.callback);
    });

    it("should set function", () => {
      const myCallback = a => a;
      const setup = new Setup();
      setup.callback = myCallback;
      assert.isFunction(setup.callback);
      assert.strictEqual(setup.callback.name, "myCallback");
    });

    it("should set true", () => {
      const setup = new Setup();
      setup.overwriteConfig = true;
      assert.isTrue(setup.overwriteConfig);
    });

    it("should set false", () => {
      const setup = new Setup({
        overwriteConfig: true,
      });
      setup.overwriteConfig = false;
      assert.isFalse(setup.overwriteConfig);
    });
  });
});

describe("_setConfigDir", () => {
  it("should throw if dir is not given", () => {
    const setup = new Setup();
    assert.throws(() => setup._setConfigDir(), "Failed to normalize undefined");
  });

  it("should throw if dir is not subdirectory of user's home dir", () => {
    const setup = new Setup();
    assert.throws(
      () => setup._setConfigDir("/foo/bar"),
      `${path.normalize("/foo/bar")} is not sub directory of ${DIR_HOME}.`
    );
  });

  it("should throw if dir is not subdirectory of user's home dir", () => {
    const setup = new Setup();
    assert.throws(
      () => setup._setConfigDir(path.join(DIR_HOME, "../foo")),
      `${path.join(DIR_HOME, "../foo")} is not sub directory of ${DIR_HOME}.`);
  });

  it("should set dir", () => {
    const configPath = path.join("foo", "bar");
    const setup = new Setup();
    setup._setConfigDir(configPath);
    assert.strictEqual(setup.configPath, path.resolve(configPath));
  });

  it("should set dir", () => {
    const configPath = path.join("foo", "../bar/baz");
    const setup = new Setup();
    setup._setConfigDir(configPath);
    assert.strictEqual(configPath, path.join("bar", "baz"));
    assert.strictEqual(setup.configPath, path.resolve(configPath));
  });
});

describe("_handleSetupCallback", () => {
  it("should get null", () => {
    const setup = new Setup();
    const res = setup._handleSetupCallback();
    assert.isNull(res);
  });

  it("should call function", () => {
    const callback = a => a;
    const setup = new Setup({
      callback,
    });
    const res = setup._handleSetupCallback();
    assert.deepEqual(res, {
      configDirPath: undefined,
      shellScriptPath: undefined,
      manifestPath: undefined,
    });
  });
});

describe("_getBrowserConfigDir", () => {
  it("should get null", () => {
    const browser = IS_WIN && "Chromium" || "CentBrowser";
    const setup = new Setup({
      browser,
    });
    const res = setup._getBrowserConfigDir();
    assert.isNull(res);
  });

  it("should get string", () => {
    const setup = new Setup({
      browser: "firefox",
    });
    const res = setup._getBrowserConfigDir();
    assert.isString(res);
  });
});

describe("_handleRegClose", () => {
  it("should warn", () => {
    let warnMsg;
    const stubWarn = sinon.stub(console, "warn").callsFake(msg => {
      warnMsg = msg;
    });
    const setup = new Setup();
    const res = setup._handleRegClose(1);
    const {calledOnce: warnCalled} = stubWarn;
    stubWarn.restore();
    if (IS_WIN) {
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      assert.isTrue(warnCalled);
      assert.strictEqual(warnMsg, `${reg} exited with 1.`);
    } else {
      assert.isFalse(warnCalled);
      assert.isUndefined(warnMsg);
    }
    assert.isNull(res);
  });

  it("should call function", () => {
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const setup = new Setup({
      browser: "firefox",
      hostName: "foo",
    });
    const stubCallback =
      sinon.stub(setup, "_handleSetupCallback").callsFake(() => true);
    const i = stubCallback.callCount;
    const res = setup._handleRegClose(0);
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    if (IS_WIN) {
      const regKey = path.join("HKEY_CURRENT_USER", "SOFTWARE", "Mozilla",
                               "NativeMessagingHosts", "foo");
      assert.isTrue(infoCalled);
      assert.strictEqual(infoMsg, `Created: ${regKey}`);
      assert.strictEqual(stubCallback.callCount, i + 1);
      assert.isTrue(res);
    } else {
      assert.isFalse(infoCalled);
      assert.isUndefined(infoMsg);
      assert.strictEqual(stubCallback.callCount, i);
      assert.isNull(res);
    }
  });
});

describe("_createReg", () => {
  it("should throw", async () => {
    const setup = new Setup();
    await setup._createReg().catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should throw", async () => {
    const setup = new Setup();
    await setup._createReg("foo").catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected Array but got Undefined.");
    });
  });

  it("should throw", async () => {
    const setup = new Setup();
    await setup._createReg("foo", ["bar"]).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should spawn child process", async () => {
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const i = stubSpawn.callCount;
    const setup = new Setup({
      hostName: "foo",
    });
    const res = await setup._createReg("bar", ["baz"]);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.isObject(res);
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.isNull(res);
    }
    stubSpawn.restore();
  });
});

describe("_createManifest", () => {
  it("should throw", async () => {
    const setup = new Setup();
    await setup._createManifest().catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, "No such file: undefined.");
    });
  });

  it("should throw", async () => {
    const file = path.join(DIR_CWD, IS_WIN && "foo.cmd" || "foo.sh");
    const setup = new Setup();
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, `No such file: ${file}.`);
    });
  });

  it("should throw", async () => {
    const file =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup();
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected Object but got Null.");
    });
  });

  it("should throw", async () => {
    const file =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup({
      browser: "firefox",
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should throw", async () => {
    const file =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup({
      browser: "firefox",
      hostDescription: "foo bar",
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should throw", async () => {
    const file =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup({
      browser: "firefox",
      hostDescription: "foo bar",
      hostName: "foo",
    });
    await setup._createManifest(file).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected Array but got Null.");
    });
  });

  // Windows
  if (IS_WIN) {
    it("should throw", async () => {
      const file =
        path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
      const setup = new Setup({
        browser: "firefox",
        hostDescription: "foo bar",
        hostName: "foo",
        webExtensionIds: ["foo@bar"],
      });
      await setup._createManifest(file).catch(e => {
        assert.instanceOf(e, Error);
        assert.strictEqual(e.message, "No such directory: undefined.");
      });
    });

    it("should throw", async () => {
      const file =
        path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
      const setup = new Setup({
        browser: "chrome",
        hostDescription: "foo bar",
        hostName: "foo",
        chromeExtensionIds: ["chrome-extension://foo"],
      });
      await setup._createManifest(file).catch(e => {
        assert.instanceOf(e, Error);
        assert.strictEqual(e.message, "No such directory: undefined.");
      });
    });
  }

  it("should create manifest", async () => {
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const dir = path.join(TMPDIR, "webextnativemsg");
    const configDir =
      await createDirectory(path.join(dir, "config", "firefox"));
    const shellPath =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup({
      browser: "firefox",
      hostDescription: "foo bar",
      hostName: "foo",
      webExtensionIds: ["foo@bar"],
    });
    const stubReg = sinon.stub(setup, "_createReg").callsFake(() => undefined);
    const i = stubReg.callCount;
    const res = await setup._createManifest(shellPath, configDir);
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    let manifestPath;
    if (IS_WIN) {
      manifestPath = path.join(configDir, "foo.json");
    } else if (IS_MAC) {
      manifestPath = path.join(os.homedir(), "Library", "Application Support",
                               "Mozilla", "NativeMessagingHosts", "foo.json");
    } else {
      manifestPath = path.join(os.homedir(), ".mozilla",
                               "native-messaging-hosts", "foo.json");
    }
    const file = fs.readFileSync(manifestPath, {
      encoding: "utf8",
      flag: "r",
    });
    const parsedFile = JSON.parse(file);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Created: ${manifestPath}`);
    if (IS_WIN) {
      assert.strictEqual(stubReg.callCount, i + 1);
    } else {
      assert.strictEqual(stubReg.callCount, i);
    }
    assert.strictEqual(res, manifestPath);
    assert.isTrue(isFile(manifestPath));
    assert.isTrue(file.endsWith("\n"));
    assert.deepEqual(parsedFile, {
      allowed_extensions: ["foo@bar"],
      description: "foo bar",
      name: "foo",
      path: shellPath,
      type: "stdio",
    });
    await removeDir(dir, TMPDIR);
  });

  it("should create manifest", async () => {
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const dir = path.join(TMPDIR, "webextnativemsg");
    const configDir =
      await createDirectory(path.join(dir, "config", "chrome"));
    const shellPath =
      path.join(DIR_CWD, "test", "file", IS_WIN && "test.cmd" || "test.sh");
    const setup = new Setup({
      browser: "chrome",
      hostDescription: "foo bar",
      hostName: "foo",
      chromeExtensionIds: ["chrome-extension://foo"],
    });
    const stubReg = sinon.stub(setup, "_createReg").callsFake(() => undefined);
    const i = stubReg.callCount;
    const res = await setup._createManifest(shellPath, configDir);
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    let manifestPath;
    if (IS_WIN) {
      manifestPath = path.join(configDir, "foo.json");
    } else if (IS_MAC) {
      manifestPath = path.join(os.homedir(), "Library", "Application Support",
                               "Google", "Chrome", "NativeMessagingHosts",
                               "foo.json");
    } else {
      manifestPath = path.join(os.homedir(), ".config", "google-chrome",
                               "NativeMessagingHosts", "foo.json");
    }
    const file = fs.readFileSync(manifestPath, {
      encoding: "utf8",
      flag: "r",
    });
    const parsedFile = JSON.parse(file);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Created: ${manifestPath}`);
    if (IS_WIN) {
      assert.strictEqual(stubReg.callCount, i + 1);
    } else {
      assert.strictEqual(stubReg.callCount, i);
    }
    assert.strictEqual(res, manifestPath);
    assert.isTrue(isFile(manifestPath));
    assert.isTrue(file.endsWith("\n"));
    assert.deepEqual(parsedFile, {
      allowed_origins: ["chrome-extension://foo"],
      description: "foo bar",
      name: "foo",
      path: shellPath,
      type: "stdio",
    });
    await removeDir(dir, TMPDIR);
  });
});

describe("_createShellScript", () => {
  it("should throw", async () => {
    const setup = new Setup();
    await setup._createShellScript().catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, "No such directory: undefined.");
    });
  });

  it("should throw", async () => {
    const dir = path.join(DIR_CWD, "foo");
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, `No such directory: ${dir}.`);
    });
  });

  it("should throw", async () => {
    const dir = await createDirectory(path.join(TMPDIR, "webextnativemsg"));
    const setup = new Setup();
    await setup._createShellScript(dir).catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    await removeDir(dir, TMPDIR);
  });

  it("should create file", async () => {
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const dir = path.join(TMPDIR, "webextnativemsg");
    const configPath = await createDirectory(path.join(dir, "config"));
    const shellPath = path.join(configPath, IS_WIN && "foo.cmd" || "foo.sh");
    const mainScriptFile = "test/file/test.js";
    const mainFilePath = path.resolve(mainScriptFile);
    const setup = new Setup({
      mainScriptFile,
      hostName: "foo",
    });
    const res = await setup._createShellScript(configPath);
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    const file = fs.readFileSync(shellPath, {
      encoding: "utf8",
      flag: "r",
    });
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    assert.strictEqual(res, shellPath);
    assert.isTrue(isFile(shellPath));
    assert.isTrue(file.endsWith("\n"));
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${mainFilePath}\n`
      );
    } else {
      assert.isDefined(process.env.SHELL);
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${process.execPath} ${mainFilePath}\n`
      );
    }
    await removeDir(dir, TMPDIR);
  });
});

describe("_createConfigDir", () => {
  it("should throw", async () => {
    const setup = new Setup();
    await setup._createConfigDir().catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should create dir", async () => {
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const dir = path.join(TMPDIR, "webextnativemsg");
    const browserConfigDir = path.join(dir, "config", "firefox");
    const setup = new Setup();
    setup._browserConfigDir = browserConfigDir;
    const res = await setup._createConfigDir();
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Created: ${browserConfigDir}`);
    assert.strictEqual(res, browserConfigDir);
    assert.isTrue(isDir(res));
    await removeDir(dir, TMPDIR);
  });
});

describe("_createFiles", () => {
  it("should call function", async () => {
    const setup = new Setup();
    const stubConfig = sinon.stub(setup, "_createConfigDir");
    const stubShell = sinon.stub(setup, "_createShellScript");
    const stubManifest = sinon.stub(setup, "_createManifest").resolves("foo");
    const stubCallback =
      sinon.stub(setup, "_handleSetupCallback").callsFake(() => true);
    const res = await setup._createFiles();
    assert.isTrue(stubConfig.calledOnce);
    assert.isTrue(stubShell.calledOnce);
    assert.isTrue(stubManifest.calledOnce);
    if (IS_WIN) {
      assert.isFalse(stubCallback.calledOnce);
      assert.isNull(res);
    } else {
      assert.isTrue(stubCallback.calledOnce);
      assert.isTrue(res);
    }
  });
});

describe("_handleBrowserConfigDir", () => {
  it("should abort if no arguments given", async () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    const setup = new Setup({
      browser: "firefox",
      configDir: path.join(DIR_CWD, "test", "file", "config"),
      hostName: "foo",
    });
    setup._readline = {
      close: stubRlClose,
    };
    setup._browserConfigDir = dirPath;
    await setup._handleBrowserConfigDir();
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {calledOnce: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isTrue(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Setup aborted: ${dirPath} already exists.`);
  });

  it("should abort if anser is not yes", async () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    const setup = new Setup({
      browser: "firefox",
      configDir: path.join(DIR_CWD, "test", "file", "config"),
      hostName: "foo",
    });
    setup._readline = {
      close: stubRlClose,
    };
    setup._browserConfigDir = dirPath;
    await setup._handleBrowserConfigDir("");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {calledOnce: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isTrue(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Setup aborted: ${dirPath} already exists.`);
  });

  it("should abort if anser is not yes", async () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    const setup = new Setup({
      browser: "firefox",
      configDir: path.join(DIR_CWD, "test", "file", "config"),
      hostName: "foo",
    });
    setup._readline = {
      close: stubRlClose,
    };
    setup._browserConfigDir = dirPath;
    await setup._handleBrowserConfigDir("n");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {calledOnce: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isTrue(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Setup aborted: ${dirPath} already exists.`);
  });

  it("should abort if anser is not yes", async () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    const setup = new Setup({
      browser: "firefox",
      configDir: path.join(DIR_CWD, "test", "file", "config"),
      hostName: "foo",
    });
    setup._readline = {
      close: stubRlClose,
    };
    setup._browserConfigDir = dirPath;
    await setup._handleBrowserConfigDir("ye");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {calledOnce: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isTrue(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    assert.strictEqual(infoMsg, `Setup aborted: ${dirPath} already exists.`);
  });

  it("should call function", async () => {
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    const setup = new Setup({
      configDir,
      browser: "firefox",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRlClose.callCount;
    const j = stubFunc.callCount;
    setup._readline = {
      close: stubRlClose,
    };
    await setup._handleBrowserConfigDir("y");
    const {calledOnce: exitCalled} = stubExit;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isFalse(infoCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(stubFunc.callCount, j + 1);
  });

  it("should call function", async () => {
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    const setup = new Setup({
      configDir,
      browser: "firefox",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRlClose.callCount;
    const j = stubFunc.callCount;
    setup._readline = {
      close: stubRlClose,
    };
    await setup._handleBrowserConfigDir("y");
    const {calledOnce: exitCalled} = stubExit;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isFalse(infoCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(stubFunc.callCount, j + 1);
  });

  it("should call function", async () => {
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    const setup = new Setup({
      configDir,
      browser: "firefox",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRlClose.callCount;
    const j = stubFunc.callCount;
    setup._readline = {
      close: stubRlClose,
    };
    await setup._handleBrowserConfigDir("y");
    const {calledOnce: exitCalled} = stubExit;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isFalse(infoCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(stubFunc.callCount, j + 1);
  });
});

describe("_handleBrowserInput", () => {
  it("should abort", () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub();
    const i = stubRlClose.callCount;
    const setup = new Setup();
    setup._readline = {
      close: stubRlClose,
    };
    setup._handleBrowserInput();
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(infoMsg, "Setup aborted: Browser not specified.");
  });

  it("should abort", () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub();
    const i = stubRlClose.callCount;
    const setup = new Setup();
    setup._readline = {
      close: stubRlClose,
    };
    setup._handleBrowserInput("");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(infoMsg, "Setup aborted: Browser not specified.");
  });

  it("should abort", () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const setup = new Setup();
    setup._handleBrowserInput("");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(infoMsg, "Setup aborted: Browser not specified.");
  });

  it("should abort", () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub();
    const i = stubRlClose.callCount;
    const setup = new Setup();
    setup._readline = {
      close: stubRlClose,
    };
    setup._handleBrowserInput("foo");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(infoMsg, "Setup aborted: foo not supported.");
  });

  it("should call function", async () => {
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRlQues = sinon.stub().callsFake(() => undefined);
    const configPath =
      await createDirectory(path.join(DIR_CWD, "test", "tmp", "config"));
    const setup = new Setup({
      configPath,
      browser: "firefox",
      webExtensionIds: ["foo@bar"],
      overwriteConfig: true,
      hostDescription: "foo bar",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRlClose.callCount;
    const j = stubRlQues.callCount;
    const k = stubFunc.callCount;
    setup._readline = {
      close: stubRlClose,
      question: stubRlQues,
    };
    await setup._handleBrowserInput("firefox");
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(stubRlQues.callCount, j);
    assert.strictEqual(stubFunc.callCount, k + 1);
    await removeDir(configPath, DIR_CWD);
  });

  it("should ask question", async () => {
    let rlQues;
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRlQues = sinon.stub().callsFake(msg => {
      rlQues = msg;
    });
    const configPath = path.join(DIR_CWD, "test", "tmp", "config");
    const browserConfigPath =
      await createDirectory(path.join(configPath, "firefox"));
    const setup = new Setup({
      configPath,
      browser: "firefox",
      webExtensionIds: ["foo@bar"],
      overwriteConfig: false,
      hostDescription: "foo bar",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRlClose.callCount;
    const j = stubRlQues.callCount;
    const k = stubFunc.callCount;
    setup._readline = {
      close: stubRlClose,
      question: stubRlQues,
    };
    await setup._handleBrowserInput("firefox");
    assert.strictEqual(stubRlClose.callCount, i);
    assert.strictEqual(stubRlQues.callCount, j + 1);
    assert.strictEqual(stubFunc.callCount, k);
    assert.strictEqual(
      rlQues,
      `${browserConfigPath} already exists. Overwrite? [y/n]\n`
    );
    await removeDir(configPath, DIR_CWD);
  });
});

describe("run", () => {
  it("should ask a question", async () => {
    let rlQues;
    const stubRlQues = sinon.stub().callsFake(msg => {
      rlQues = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRl = sinon.stub(readline, "createInterface").returns({
      close: stubRlClose,
      question: stubRlQues,
    });
    const i = stubRl.callCount;
    const j = stubRlQues.callCount;
    const k = stubRlClose.callCount;
    const setup = new Setup({
      webExtensionIds: ["foo@bar"],
      chromeExtensionIds: ["chrome-extension://foo"],
    });
    await setup.run();
    assert.strictEqual(stubRl.callCount, i + 1);
    assert.strictEqual(stubRlQues.callCount, j + 1);
    assert.strictEqual(stubRlClose.callCount, k);
    assert.include(
      rlQues,
      "Enter which browser you would like to set up the host for:\n"
    );
    stubRl.restore();
  });

  it("should ask a question", async () => {
    let rlQues;
    const stubRlQues = sinon.stub().callsFake(msg => {
      rlQues = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRl = sinon.stub(readline, "createInterface").returns({
      close: stubRlClose,
      question: stubRlQues,
    });
    const i = stubRl.callCount;
    const j = stubRlQues.callCount;
    const k = stubRlClose.callCount;
    const configPath = path.resolve(path.join("test", "file", "config"));
    const setup = new Setup({
      configPath,
      browser: "firefox",
      overwriteConfig: false,
    });
    await setup.run();
    assert.strictEqual(stubRl.callCount, i + 1);
    assert.strictEqual(stubRlQues.callCount, j + 1);
    assert.strictEqual(stubRlClose.callCount, k);
    assert.include(
      rlQues,
      `${path.join(configPath, "firefox")} already exists. Overwrite? [y/n]\n`
    );
    stubRl.restore();
  });

  it("should call function", async () => {
    const stubRlQues = sinon.stub().callsFake(() => undefined);
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRl = sinon.stub(readline, "createInterface").returns({
      close: stubRlClose,
      question: stubRlQues,
    });
    const configPath =
      await createDirectory(path.join(DIR_CWD, "test", "tmp", "config"));
    const setup = new Setup({
      configPath,
      browser: "firefox",
      webExtensionIds: ["foo@bar"],
      overwriteConfig: true,
      hostDescription: "foo bar",
      hostName: "foo",
    });
    const stubFunc = sinon.stub(setup, "_createFiles").resolves(undefined);
    const i = stubRl.callCount;
    const j = stubRlQues.callCount;
    const k = stubRlClose.callCount;
    const l = stubFunc.callCount;
    await setup.run();
    assert.strictEqual(stubRl.callCount, i + 1);
    assert.strictEqual(stubRlQues.callCount, j);
    assert.strictEqual(stubRlClose.callCount, k + 1);
    assert.strictEqual(stubFunc.callCount, l + 1);
    stubRl.restore();
    await removeDir(configPath, DIR_CWD);
  });
});
