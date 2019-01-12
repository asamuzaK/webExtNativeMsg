"use strict";
/* api */
const {
  Setup,
  abortSetup, createConfig, createFiles, createReg, createShellScript,
  getBrowserConfigDir, getBrowserData, handleBrowserConfigDir,
  handleBrowserInput, handleRegClose, handleRegStderr, handleSetupCallback,
  vars,
} = require("../modules/setup");
const {createDirectory, removeDir} = require("../modules/file-util");
const {quoteArg} = require("../modules/common");
const {assert} = require("chai");
const {afterEach, beforeEach, describe, it} = require("mocha");
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

describe("getBrowserConfigDir", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.configDir = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.configDir = null;
  });

  it("should get null", () => {
    assert.isNull(getBrowserConfigDir());
  });

  it("should get null", () => {
    vars.browser = {};
    vars.configDir = TMPDIR;
    const res = getBrowserConfigDir();
    assert.isNull(res);
  });

  it("should get dir", () => {
    vars.browser = {
      alias: "firefox",
    };
    vars.configDir = TMPDIR;
    const res = getBrowserConfigDir();
    assert.strictEqual(res, path.join(TMPDIR, "firefox"));
  });

  it("should get dir", () => {
    vars.browser = {
      alias: "firefox",
      aliasLinux: "foo",
      aliasMac: "bar",
      aliasWin: "baz",
    };
    vars.configDir = TMPDIR;
    const res = getBrowserConfigDir();
    if (IS_WIN) {
      assert.strictEqual(res, path.join(TMPDIR, "baz"));
    } else if (IS_MAC) {
      assert.strictEqual(res, path.join(TMPDIR, "bar"));
    } else {
      assert.strictEqual(res, path.join(TMPDIR, "foo"));
    }
  });
});

describe("handleSetupCallback", () => {
  beforeEach(() => {
    vars.configPath = null;
    vars.manifestPath = null;
    vars.shellPath = null;
    vars.callback = null;
  });
  afterEach(() => {
    vars.configPath = null;
    vars.manifestPath = null;
    vars.shellPath = null;
    vars.callback = null;
  });

  it("should get null", () => {
    assert.isNull(handleSetupCallback());
  });

  it("should call callback", () => {
    vars.configPath = "config";
    vars.manifestPath = "manifest";
    vars.shellPath = "shell";
    vars.callback = obj => obj;
    const res = handleSetupCallback();
    assert.deepEqual(res, {
      configDirPath: "config",
      manifestPath: "manifest",
      shellScriptPath: "shell",
    });
  });
});

describe("createConfig", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.configPath = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.configPath = null;
  });

  it("should throw", async () => {
    await createConfig().catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should get path", async () => {
    let infoMsg;
    const dirPath = path.join(TMPDIR, "firefox");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    vars.browser = {
      alias: "firefox",
    };
    vars.configDir = TMPDIR;
    const res = await createConfig();
    const {calledOnce} = stubInfo;
    stubInfo.restore();
    assert.isTrue(calledOnce);
    assert.strictEqual(infoMsg, `Created: ${dirPath}`);
    assert.strictEqual(res, dirPath);
    assert.strictEqual(vars.configPath, dirPath);
    removeDir(dirPath, TMPDIR);
  });
});

describe("createShellScript", () => {
  beforeEach(() => {
    vars.hostName = null;
    vars.mainFile = null;
  });
  afterEach(() => {
    vars.hostName = null;
    vars.mainFile = null;
  });

  it("should throw", async () => {
    await createShellScript().catch(e => {
      assert.strictEqual(e.message, "No such directory: undefined.");
    });
  });

  it("should throw", async () => {
    await createShellScript("foo/bar").catch(e => {
      assert.strictEqual(e.message, "No such directory: foo/bar.");
    });
  });

  it("should throw", async () => {
    vars.mainFile = "foo";
    await createShellScript(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should throw", async () => {
    vars.hostName = "foo";
    await createShellScript(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should get path", async () => {
    const configDir = path.join(TMPDIR, "webextnativemsg", "config");
    const shellPath = path.join(configDir, IS_WIN && "foo.cmd" || "foo.sh");
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    vars.hostName = "foo";
    vars.mainFile = "bar";
    const configPath = await createDirectory(configDir);
    const res = await createShellScript(configPath);
    stubInfo.restore();
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });

  it("should get path", async () => {
    const configDir = path.join(TMPDIR, "webextnativemsg", "config");
    const shellPath = path.join(configDir, IS_WIN && "foo.cmd" || "foo.sh");
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    vars.hostName = "foo";
    vars.mainFile = path.resolve(path.join("test", "file", "test.js"));
    const configPath = await createDirectory(configDir);
    const res = await createShellScript(configPath);
    stubInfo.restore();
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });

  it("should get content", async () => {
    const configDir = path.join(TMPDIR, "webextnativemsg", "config");
    const shellPath = path.join(configDir, IS_WIN && "foo.cmd" || "foo.sh");
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    vars.hostName = "foo";
    vars.mainFile = "test/file/test.js";
    const filePath = path.resolve(vars.mainFile);
    const configPath = await createDirectory(configDir);
    const res = await createShellScript(configPath);
    stubInfo.restore();
    const file = fs.readFileSync(shellPath, {
      encoding: "utf8",
      flag: "r",
    });
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    assert.isTrue(fs.existsSync(filePath));
    if (IS_WIN) {
      assert.strictEqual(
        file,
        `@echo off\n${quoteArg(process.execPath)} ${filePath}\n`
      );
    } else {
      assert.isDefined(process.env.SHELL);
      assert.strictEqual(
        file,
        `#!${process.env.SHELL}\n${process.execPath} ${filePath}\n`
      );
    }
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
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

describe("handleRegClose", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.hostName = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.hostName = null;
  });

  if (IS_WIN) {
    it("should warn", () => {
      let wrn;
      const stubWarn = sinon.stub(console, "warn").callsFake(msg => {
        wrn = msg;
      });
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      handleRegClose(1);
      stubWarn.restore();
      assert.strictEqual(wrn, `${reg} exited with 1.`);
    });

    it("should call function", async () => {
      let infoMsg;
      vars.browser = {
        regWin: ["foo"],
      };
      vars.hostName = "bar";
      const stubInfo = sinon.stub(console, "info").callsFake(msg => {
        infoMsg = msg;
      });
      await handleRegClose(0);
      stubInfo.restore();
      assert.strictEqual(infoMsg, `Created: ${path.join("foo", "bar")}`);
    });
  }
});

describe("createReg", () => {
  it("should throw if no argument given", async () => {
    await createReg().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should throw if manifestPath not given", async () => {
    await createReg("foo").catch(e => {
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should throw if regWin not given", async () => {
    await createReg("foo", "bar").catch(e => {
      assert.strictEqual(e.message, "Expected Array but got Undefined.");
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
    const res = await createReg("foo", "bar", ["baz"]);
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

describe("createFiles", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.callback = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.callback = null;
  });

  it("should throw", async () => {
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected Object but got Null.");
    });
  });

  it("should throw", async () => {
    vars.browser = {};
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should throw", async () => {
    vars.browser = {};
    vars.hostDesc = "foo bar";
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
  });

  it("should throw", async () => {
    const stubInfo = sinon.stub(console, "info");
    vars.browser = getBrowserData("firefox");
    vars.hostDesc = "foo bar";
    vars.hostName = "baz";
    vars.configDir = path.join(TMPDIR, "webextnativemsg", "config");
    vars.mainFile = path.resolve(path.join("test", "file", "test.js"));
    await createFiles().catch(e => {
      stubInfo.restore();
      assert.strictEqual(e.message, "Expected Array but got Null.");
    });
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });

  it("should throw", async () => {
    const stubInfo = sinon.stub(console, "info");
    vars.browser = getBrowserData("chrome");
    vars.hostDesc = "foo bar";
    vars.hostName = "baz";
    vars.configDir = path.join(TMPDIR, "webextnativemsg", "config");
    vars.mainFile = path.resolve(path.join("test", "file", "test.js"));
    await createFiles().catch(e => {
      stubInfo.restore();
      assert.strictEqual(e.message, "Expected Array but got Null.");
    });
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });

  it("should call function", async () => {
    const stubInfo = sinon.stub(console, "info");
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubSpawn.callCount;
    const j = stubFunc.callCount;
    const browser = getBrowserData("firefox");
    const configDir = path.join(DIR_CWD, "test", "file", "tmp");
    vars.browser = browser;
    vars.configDir = configDir;
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await createFiles();
    const {called: infoCalled} = stubInfo;
    stubInfo.restore();
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(stubFunc.callCount, j);
      assert.strictEqual(vars.manifestPath,
                         path.resolve(configDir, "firefox", "foo.json"));
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      assert.strictEqual(
        vars.manifestPath,
        path.resolve(...browser.hostMac, "foo.json")
      );
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      assert.strictEqual(
        vars.manifestPath,
        path.resolve(...browser.hostLinux, "foo.json")
      );
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
    await removeDir(configDir, DIR_CWD);
  });

  it("should call function", async () => {
    const stubInfo = sinon.stub(console, "info");
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubSpawn.callCount;
    const j = stubFunc.callCount;
    const browser = getBrowserData("chrome");
    const configDir = path.join(DIR_CWD, "test", "file", "tmp");
    vars.browser = browser;
    vars.configDir = configDir;
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await createFiles();
    const {called: infoCalled} = stubInfo;
    stubInfo.restore();
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(stubFunc.callCount, j);
      assert.strictEqual(vars.manifestPath,
                         path.resolve(configDir, "chrome", "foo.json"));
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      assert.strictEqual(
        vars.manifestPath,
        path.resolve(...browser.hostMac, "foo.json")
      );
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      assert.strictEqual(
        vars.manifestPath,
        path.resolve(...browser.hostLinux, "foo.json")
      );
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
    await removeDir(configDir, DIR_CWD);
  });

  it("should get new line at EOF", async () => {
    const stubInfo = sinon.stub(console, "info");
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const browser = getBrowserData("firefox");
    const configDir = path.join(DIR_CWD, "test", "file", "tmp");
    vars.browser = browser;
    vars.configDir = configDir;
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await createFiles();
    stubInfo.restore();
    const file = fs.readFileSync(vars.manifestPath, {
      encoding: "utf8",
      flag: "r",
    });
    assert.isTrue(file.endsWith("\n"));
    if (IS_MAC) {
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else if (!IS_WIN) {
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
    await removeDir(configDir, DIR_CWD);
  });

  it("should get new line at EOF", async () => {
    const stubInfo = sinon.stub(console, "info");
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const browser = getBrowserData("chrome");
    const configDir = path.join(DIR_CWD, "test", "file", "tmp");
    vars.browser = browser;
    vars.configDir = configDir;
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await createFiles();
    stubInfo.restore();
    const file = fs.readFileSync(vars.manifestPath, {
      encoding: "utf8",
      flag: "r",
    });
    assert.isTrue(file.endsWith("\n"));
    if (IS_MAC) {
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else if (!IS_WIN) {
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
    await removeDir(configDir, DIR_CWD);
  });
});

describe("handleBrowserConfigDir", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostName = null;
    vars.rl = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.callback = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostName = null;
    vars.rl = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.callback = null;
  });

  it("should throw", () => {
    assert.throws(() => handleBrowserConfigDir());
  });

  it("should abort if no arguments given", async () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    vars.browser = getBrowserData("firefox");
    vars.configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    await handleBrowserConfigDir();
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
    vars.browser = getBrowserData("firefox");
    vars.configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    await handleBrowserConfigDir("");
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
    vars.browser = getBrowserData("firefox");
    vars.configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    await handleBrowserConfigDir("n");
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
    vars.browser = getBrowserData("firefox");
    vars.configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    await handleBrowserConfigDir("ye");
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
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubSpawn.callCount;
    const j = stubFunc.callCount;
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.browser = getBrowserData("firefox");
    vars.configDir = configDir;
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foobar";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await handleBrowserConfigDir("y");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(stubFunc.callCount, j);
      fs.unlinkSync(path.join(configDir, "firefox", "foobar.cmd"));
      fs.unlinkSync(path.join(configDir, "firefox", "foobar.json"));
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostMac, "foobar.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foobar.json"));
    }
    stubSpawn.restore();
  });

  it("should call function", async () => {
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubSpawn.callCount;
    const j = stubFunc.callCount;
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.browser = getBrowserData("firefox");
    vars.configDir = configDir;
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await handleBrowserConfigDir("yes");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(stubFunc.callCount, j);
      fs.unlinkSync(path.join(configDir, "firefox", "foo.cmd"));
      fs.unlinkSync(path.join(configDir, "firefox", "foo.json"));
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
  });

  it("should call function", async () => {
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubSpawn.callCount;
    const j = stubFunc.callCount;
    const configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.browser = getBrowserData("firefox");
    vars.configDir = configDir;
    vars.hostName = "foo";
    vars.rl = {
      close: stubRlClose,
    };
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    await handleBrowserConfigDir("Y");
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    const {called: infoCalled} = stubInfo;
    stubExit.restore();
    stubInfo.restore();
    assert.isFalse(exitCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(infoCalled);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, i + 1);
      assert.strictEqual(stubFunc.callCount, j);
      fs.unlinkSync(path.join(configDir, "firefox", "foo.cmd"));
      fs.unlinkSync(path.join(configDir, "firefox", "foo.json"));
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, i);
      assert.strictEqual(stubFunc.callCount, j + 1);
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
  });
});

describe("handleBrowserInput", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostName = null;
    vars.rl = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.callback = null;
    vars.overwriteConfig = false;
  });
  afterEach(() => {
    vars.browser = null;
    vars.configDir = null;
    vars.hostName = null;
    vars.rl = null;
    vars.chromeExtIds = null;
    vars.webExtIds = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.callback = null;
    vars.overwriteConfig = false;
  });

  it("should abort", () => {
    let infoMsg;
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const stubRlClose = sinon.stub();
    const i = stubRlClose.callCount;
    vars.rl = {
      close: stubRlClose,
    };
    handleBrowserInput();
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
    vars.rl = {
      close: stubRlClose,
    };
    handleBrowserInput("");
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
    handleBrowserInput("");
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
    vars.rl = {
      close: stubRlClose,
    };
    handleBrowserInput("foo");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(infoMsg, "Setup aborted: foo not supported.");
  });

  it("should throw", async () => {
    assert.throws(() => handleBrowserInput("firefox"),
                  TypeError,
                  "Expected String but got Null.");
  });

  it("should ask question", async () => {
    let rlQues;
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRlQues = sinon.stub().callsFake(msg => {
      rlQues = msg;
    });
    const stubSpawn = sinon.stub(childProcess, "spawn");
    const stubFunc = sinon.stub();
    const i = stubRlClose.callCount;
    const j = stubRlQues.callCount;
    const k = stubSpawn.callCount;
    const l = stubFunc.callCount;
    const browser = getBrowserData("firefox");
    const dirPath = path.join(DIR_CWD, "test", "file", "config", "firefox");
    vars.browser = browser;
    vars.configDir = path.join(DIR_CWD, "test", "file", "config");
    vars.hostName = "foo";
    vars.overwriteConfig = false;
    vars.rl = {
      close: stubRlClose,
      question: stubRlQues,
    };
    vars.callback = stubFunc;
    await handleBrowserInput("firefox");
    assert.strictEqual(stubRlClose.callCount, i);
    assert.strictEqual(stubRlQues.callCount, j + 1);
    assert.strictEqual(stubSpawn.callCount, k);
    assert.strictEqual(stubFunc.callCount, l);
    assert.strictEqual(rlQues, `${dirPath} already exists. Overwrite? [y/n]\n`);
    stubSpawn.restore();
  });

  it("should call function", async () => {
    const stubInfo = sinon.stub(console, "info");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRlQues = sinon.stub().callsFake(() => undefined);
    const stubSpawn = sinon.stub(childProcess, "spawn").returns({
      on: a => a,
      stderr: {
        on: a => a,
      },
    });
    const stubFunc = sinon.stub();
    const i = stubRlClose.callCount;
    const j = stubRlQues.callCount;
    const k = stubSpawn.callCount;
    const l = stubFunc.callCount;
    const browser = getBrowserData("firefox");
    vars.browser = browser;
    vars.configDir = path.join(DIR_CWD, "test", "tmp", "config");
    vars.rl = {
      close: stubRlClose,
      question: stubRlQues,
    };
    vars.chromeExtIds = ["chrome-extension://foo"];
    vars.webExtIds = ["foo@bar"];
    vars.hostDesc = "foo bar";
    vars.hostName = "foo";
    vars.mainFile = path.join("test", "file", "test.js");
    vars.callback = stubFunc;
    vars.overwriteConfig = true;
    await handleBrowserInput("firefox");
    const {calledOnce: infoCalled} = stubInfo;
    stubInfo.restore();
    assert.strictEqual(stubRlClose.callCount, i + 1);
    assert.strictEqual(stubRlQues.callCount, j);
    if (IS_WIN) {
      assert.strictEqual(stubSpawn.callCount, k + 1);
      assert.strictEqual(stubFunc.callCount, l);
      assert.isFalse(infoCalled);
    } else if (IS_MAC) {
      assert.strictEqual(stubSpawn.callCount, k);
      assert.strictEqual(stubFunc.callCount, l + 1);
      assert.isTrue(infoCalled);
      fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
    } else {
      assert.strictEqual(stubSpawn.callCount, k);
      assert.strictEqual(stubFunc.callCount, l + 1);
      assert.isTrue(infoCalled);
      fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
    }
    stubSpawn.restore();
    await removeDir(path.join(DIR_CWD, "test", "tmp", "config", DIR_CWD))
  });
});

describe("Setup", () => {
  beforeEach(() => {
    vars.browser = null;
    vars.callback = null;
    vars.chromeExtIds = null;
    vars.configDir = null;
    vars.configPath = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.manifestPath = null;
    vars.overwriteConfig = false;
    vars.rl = null;
    vars.shellPath = null;
    vars.webExtIds = null;
  });
  afterEach(() => {
    vars.browser = null;
    vars.callback = null;
    vars.chromeExtIds = null;
    vars.configDir = null;
    vars.configPath = null;
    vars.hostDesc = null;
    vars.hostName = null;
    vars.mainFile = null;
    vars.manifestPath = null;
    vars.overwriteConfig = false;
    vars.rl = null;
    vars.shellPath = null;
    vars.webExtIds = null;
  });

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
        chromeExtensionIds: ["foo"],
      });
      assert.deepEqual(setup.chromeExtensionIds, ["foo"]);
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
    it("should get null", () => {
      const setup = new Setup({
        browser: "firefox",
      });
      setup.browser = "";
      assert.isNull(setup.browser);
    });

    it("should get null", () => {
      const setup = new Setup({
        browser: "firefox",
      });
      setup.browser = "foo";
      assert.isNull(setup.browser);
    });

    it("should get string", () => {
      const setup = new Setup({
        browser: "chrome",
      });
      setup.browser = "firefox";
      assert.strictEqual(setup.browser, "firefox");
    });

    it("should get string", () => {
      const myPath = path.join(DIR_CWD, "foo");
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should get string", () => {
      const myPath = path.join(DIR_CONFIG, "myhost", "config");
      const setup = new Setup();
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should get null", () => {
      const setup = new Setup({
        hostDescription: "My host description",
      });
      setup.hostDescription = 1;
      assert.isNull(setup.hostDescription);
    });

    it("should get string", () => {
      const setup = new Setup();
      setup.hostDescription = "My host description";
      assert.strictEqual(setup.hostDescription, "My host description");
    });

    it("should get null", () => {
      const setup = new Setup({
        hostName: "myhost",
      });
      setup.hostName = 1;
      assert.isNull(setup.hostName);
    });

    it("should get string", () => {
      const setup = new Setup();
      setup.hostName = "myhost";
      assert.strictEqual(setup.hostName, "myhost");
    });

    it("should get string", () => {
      const setup = new Setup({
        mainScriptFile: "main.js",
      });
      setup.mainScriptFile = 1;
      assert.strictEqual(setup.mainScriptFile, "index.js");
    });

    it("should get string", () => {
      const setup = new Setup();
      setup.mainScriptFile = "main.js";
      assert.strictEqual(setup.mainScriptFile, "main.js");
    });

    it("should get null", () => {
      const setup = new Setup({
        chromeExtensionIds: ["chrome://abc"],
      });
      setup.chromeExtensionIds = [];
      assert.isNull(setup.chromeExtensionIds);
    });

    it("should get array", () => {
      const setup = new Setup();
      setup.chromeExtensionIds = ["chrome://abc"];
      assert.deepEqual(setup.chromeExtensionIds, ["chrome://abc"]);
    });

    it("should get null", () => {
      const setup = new Setup({
        webExtensionIds: ["myapp@webextension"],
      });
      setup.webExtensionIds = [];
      assert.isNull(setup.webExtensionIds);
    });

    it("should get array", () => {
      const setup = new Setup();
      setup.webExtensionIds = ["myapp@webextension"];
      assert.deepEqual(setup.webExtensionIds, ["myapp@webextension"]);
    });

    it("should get null", () => {
      const myCallback = a => a;
      const setup = new Setup({
        callback: myCallback,
      });
      setup.callback = 1;
      assert.isNull(setup.callback);
    });

    it("should get function", () => {
      const myCallback = a => a;
      const setup = new Setup();
      setup.callback = myCallback;
      assert.isFunction(setup.callback);
      assert.strictEqual(setup.callback.name, "myCallback");
    });

    it("should get true", () => {
      const setup = new Setup();
      setup.overwriteConfig = true;
      assert.isTrue(setup.overwriteConfig);
    });

    it("should get false", () => {
      const setup = new Setup({
        overwriteConfig: true,
      });
      setup.overwriteConfig = false;
      assert.isFalse(setup.overwriteConfig);
    });
  });

  describe("_setConfigDir", () => {
    it("should throw if dir is not given", () => {
      const setup = new Setup();
      assert.throws(() => setup._setConfigDir(),
                    "Failed to normalize undefined");
    });

    it("should throw if dir is not subdirectory of user's home dir", () => {
      const setup = new Setup();
      assert.throws(() => setup._setConfigDir("/foo/bar/"),
                    `Config path is not sub directory of ${DIR_HOME}.`);
    });

    it("should throw if dir is not subdirectory of user's home dir", () => {
      const setup = new Setup();
      assert.throws(() => setup._setConfigDir(path.join(DIR_HOME, "../foo")),
                    `Config path is not sub directory of ${DIR_HOME}.`);
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

  describe("run", () => {
    it("should throw", async () => {
      const stubRl = sinon.stub(readline, "createInterface").returns(undefined);
      const i = stubRl.callCount;
      const setup = new Setup();
      assert.throws(() => setup.run(), "Failed to run setup.");
      assert.strictEqual(stubRl.callCount, i + 1);
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
      const setup = new Setup({
        webExtensionIds: ["foo@bar"],
        chromeExtensionIds: ["baz"],
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
      const stubInfo = sinon.stub(console, "info");
      const stubSpawn = sinon.stub(childProcess, "spawn").returns({
        on: a => a,
        stderr: {
          on: a => a,
        },
      });
      const stubFunc = sinon.stub().callsFake(a => a);
      const i = stubRl.callCount;
      const j = stubRlQues.callCount;
      const k = stubRlClose.callCount;
      const l = stubSpawn.callCount;
      const m = stubFunc.callCount;
      const configDir = [DIR_CWD, "test", "tmp", "config"];
      const configPath = await createDirectory(path.join(...configDir));
      const setup = new Setup({
        configPath,
        browser: "firefox",
        webExtensionIds: ["foo@bar"],
        overwriteConfig: true,
        callback: stubFunc,
        hostDescription: "foo bar",
        hostName: "foo",
      });
      await setup.run();
      const {called: infoCalled} = stubInfo;
      stubInfo.restore();
      assert.strictEqual(stubRl.callCount, i + 1);
      assert.strictEqual(stubRlQues.callCount, j);
      assert.strictEqual(stubRlClose.callCount, k + 1);
      assert.isTrue(infoCalled);
      if (IS_WIN) {
        assert.strictEqual(stubSpawn.callCount, l + 1);
        assert.strictEqual(stubFunc.callCount, m);
      } else if (IS_MAC) {
        assert.strictEqual(stubSpawn.callCount, l);
        assert.strictEqual(stubFunc.callCount, m + 1);
        fs.unlinkSync(path.resolve(...browser.hostMac, "foo.json"));
      } else {
        assert.strictEqual(stubSpawn.callCount, l);
        assert.strictEqual(stubFunc.callCount, m + 1);
        fs.unlinkSync(path.resolve(...browser.hostLinux, "foo.json"));
      }
      stubRl.restore();
      stubSpawn.restore();
      await removeDir(path.join(configPath, "firefox"), configPath);
    });
  });
});

