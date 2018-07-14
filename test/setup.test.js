"use strict";
/* api */
const {Setup} = require("../modules/setup");
const {createDir, isDir, removeDir} = require("../modules/file-util");
const {assert} = require("chai");
const {beforeEach, describe, it} = require("mocha");
const childProcess = require("child_process");
const os = require("os");
const path = require("path");
const process = require("process");
const rewire = require("rewire");
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

const setupJs = rewire("../modules/setup");

describe("abortSetup", () => {
  it("should exit with message", () => {
    let info;
    const abortSetup = setupJs.__get__("abortSetup");
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
    const getBrowserData = setupJs.__get__("getBrowserData");
    assert.isObject(getBrowserData("firefox"));
  });

  it("should get object if key matches", () => {
    const getBrowserData = setupJs.__get__("getBrowserData");
    assert.isObject(getBrowserData("chrome"));
  });

  it("should get null if no argument given", () => {
    const getBrowserData = setupJs.__get__("getBrowserData");
    assert.isNull(getBrowserData());
  });

  it("should get null if key does not match", () => {
    const getBrowserData = setupJs.__get__("getBrowserData");
    assert.isNull(getBrowserData("foo"));
  });
});

describe("getBrowserConfigDir", () => {
  it("should get null", () => {
    const getBrowserConfigDir = setupJs.__get__("getBrowserConfigDir");
    assert.isNull(getBrowserConfigDir());
  });

  it("should get dir", () => {
    const getBrowserConfigDir = setupJs.__get__("getBrowserConfigDir");
    const vars = setupJs.__set__("vars", {
      browser: {
        alias: "firefox",
      },
      configDir: [TMPDIR],
    });
    const res = getBrowserConfigDir();
    assert.isTrue(Array.isArray(res));
    assert.deepEqual(res, [TMPDIR, "firefox"]);
    vars();
  });
});

describe("handleSetupCallback", () => {
  it("should get null", () => {
    const handleSetupCallback = setupJs.__get__("handleSetupCallback");
    assert.isNull(handleSetupCallback());
  });

  it("should call callback", () => {
    const handleSetupCallback = setupJs.__get__("handleSetupCallback");
    const vars = setupJs.__set__("vars", {
      configPath: "config",
      manifestPath: "manifest",
      shellPath: "shell",
      callback: obj => obj,
    });
    const res = handleSetupCallback();
    assert.deepEqual(res, {
      configDirPath: "config",
      manifestPath: "manifest",
      shellScriptPath: "shell",
    });
    vars();
  });
});

describe("createConfig", () => {
  it("should throw", async () => {
    const createConfig = setupJs.__get__("createConfig");
    await createConfig().catch(e => {
      assert.strictEqual(e.message, "Expected Array but got Null.");
    });
  });

  it("should get path", async () => {
    const createConfig = setupJs.__get__("createConfig");
    let infoMsg;
    const dirPath = path.join(TMPDIR, "firefox");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const vars = setupJs.__set__("vars", {
      browser: {
        alias: "firefox",
      },
      configDir: [TMPDIR],
    });
    const res = await createConfig();
    const {calledOnce} = stubInfo;
    stubInfo.restore();
    assert.isTrue(calledOnce);
    assert.strictEqual(infoMsg, `Created: ${dirPath}`);
    assert.strictEqual(res, dirPath);
    vars();
    removeDir(dirPath, TMPDIR);
  });
});

describe("createShellScript", () => {
  it("should throw", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    await createShellScript().catch(e => {
      assert.strictEqual(e.message, "No such directory: undefined.");
    });
  });

  it("should throw", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    await createShellScript("foo/bar").catch(e => {
      assert.strictEqual(e.message, "No such directory: foo/bar.");
    });
  });

  it("should throw", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    const vars = setupJs.__set__("vars", {
      hostName: null,
      mainFile: "foo",
    });
    await createShellScript(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    const vars = setupJs.__set__("vars", {
      hostName: "foo",
      mainFile: null,
    });
    await createShellScript(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should get path", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    const configDir = [TMPDIR, "webextnativemsg", "config"];
    const shellPath = path.join(...configDir, IS_WIN && "foo.cmd" || "foo.sh");
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const vars = setupJs.__set__("vars", {
      hostName: "foo",
      mainFile: "bar",
    });
    const configPath = await createDir(configDir);
    const res = await createShellScript(configPath);
    stubInfo.restore();
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    vars();
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });

  it("should get path", async () => {
    const createShellScript = setupJs.__get__("createShellScript");
    const configDir = [TMPDIR, "webextnativemsg", "config"];
    const shellPath = path.join(...configDir, IS_WIN && "foo.cmd" || "foo.sh");
    let infoMsg;
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const vars = setupJs.__set__("vars", {
      hostName: "foo",
      mainFile: path.resolve(path.join("test", "file", "test.js")),
    });
    const configPath = await createDir(configDir);
    const res = await createShellScript(configPath);
    stubInfo.restore();
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    vars();
    await removeDir(path.join(TMPDIR, "webextnativemsg"), TMPDIR);
  });
});

describe("handleRegStdErr", () => {
  if (IS_WIN) {
    it("should console error", () => {
      let err;
      const handleRegStderr = setupJs.__get__("handleRegStderr");
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
  if (IS_WIN) {
    it("should warn", () => {
      let wrn;
      const handleRegClose = setupJs.__get__("handleRegClose");
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
      const handleRegClose = setupJs.__get__("handleRegClose");
      const vars = setupJs.__set__("vars", {
        browser: {
          regWin: ["foo"],
        },
        hostName: "bar",
      });
      const stubInfo = sinon.stub(console, "info").callsFake(msg => {
        infoMsg = msg;
      });
      await handleRegClose(0);
      stubInfo.restore();
      assert.strictEqual(infoMsg, `Created: ${path.join("foo", "bar")}`);
      vars();
    });
  }
});

describe("createReg", () => {
  if (IS_WIN) {
    it("should throw if no argument given", async () => {
      const createReg = setupJs.__get__("createReg");
      await createReg().catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.");
      });
    });

    it("should throw if manifestPath not given", async () => {
      const createReg = setupJs.__get__("createReg");
      await createReg("foo").catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.");
      });
    });

    it("should throw if regWin not given", async () => {
      const createReg = setupJs.__get__("createReg");
      await createReg("foo", "bar").catch(e => {
        assert.strictEqual(e.message, "Expected Array but got Undefined.");
      });
    });

    it("should spawn child process", async () => {
      const createReg = setupJs.__get__("createReg");
      const stubSpawn = sinon.stub(childProcess, "spawn").returns({
        on: a => a,
        stderr: {
          on: a => a,
        },
      });
      await createReg("foo", "bar", ["baz"]);
      const {calledOnce} = stubSpawn;
      stubSpawn.restore();
      assert.isTrue(calledOnce);
    });
  }
});

describe("createFiles", () => {
  it("should throw", async () => {
    const createFiles = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: null,
    });
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected Object but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const createFiles = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: {},
      hostDesc: null,
    });
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const createFiles = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: {},
      hostDesc: "foo",
      hostName: null,
    });
    await createFiles().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });
});

describe("handleBrowserInput", () => {
  it("should abort", () => {
    const handleBrowserInput = setupJs.__get__("handleBrowserInput");
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    handleBrowserInput();
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
  });

  it("should abort", () => {
    const handleBrowserInput = setupJs.__get__("handleBrowserInput");
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    handleBrowserInput("foo");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
  });

  it("should abort", () => {
    const handleBrowserInput = setupJs.__get__("handleBrowserInput");
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info");
    handleBrowserInput("");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
  });

  it("should get function", async () => {
    const handleBrowserInput = setupJs.__get__("handleBrowserInput");
    const stubCreateFiles = sinon.stub().callsFake(async () => true);
    const createFiles = setupJs.__set__("createFiles", stubCreateFiles);
    const stubAbort = sinon.stub().callsFake(msg => msg);
    const abortSetup = setupJs.__set__("abortSetup", stubAbort);
    const vars = setupJs.__set__("vars", {
      browser: {
        alias: "firefox",
      },
      configDir: [TMPDIR],
    });
    await handleBrowserInput("firefox");
    const {called: calledCreateFiles} = stubCreateFiles;
    const {called: calledAbort} = stubAbort;
    assert.isTrue(calledCreateFiles);
    assert.isFalse(calledAbort);
    abortSetup();
    createFiles();
    vars();
  });
});

/* Setup */
describe("Setup", () => {
  let setup, setup2;

  beforeEach(() => {
    setup = new Setup({
      hostDescription: "My host description",
      hostName: "myhost",
    });
    setup2 = null;
  });

  it("should create an instance", () => {
    assert.instanceOf(setup, Setup);
  });

  /* constructor */
  describe("constructor", () => {
    it("should set browser", () => {
      const browser = "firefox";
      setup2 = new Setup({
        browser,
      });
      assert.strictEqual(setup2.browser, browser);
    });

    it("should set configPath", () => {
      const configPath = path.join("test", "file", "config");
      setup2 = new Setup({
        configPath,
      });
      assert.strictEqual(setup2.configPath, path.resolve(configPath));
    });

    it("should set hostDescription", () => {
      const hostDescription = "foo bar";
      setup2 = new Setup({
        hostDescription,
      });
      assert.strictEqual(setup2.hostDescription, hostDescription);
    });

    it("should set hostName", () => {
      const hostName = "foo";
      setup2 = new Setup({
        hostName,
      });
      assert.strictEqual(setup2.hostName, hostName);
    });

    it("should set mainScriptFile", () => {
      const mainScriptFile = "foo.js";
      setup2 = new Setup({
        mainScriptFile,
      });
      assert.strictEqual(setup2.mainScriptFile, mainScriptFile);
    });

    it("should set chromeExtensionIds", () => {
      const chromeExtensionIds = ["chrome-extension://foo"];
      setup2 = new Setup({
        chromeExtensionIds,
      });
      assert.deepEqual(setup2.chromeExtensionIds, chromeExtensionIds);
    });

    it("should set webExtensionIds", () => {
      const webExtensionIds = ["foo@bar"];
      setup2 = new Setup({
        webExtensionIds,
      });
      assert.deepEqual(setup2.webExtensionIds, webExtensionIds);
    });

    it("should set callback", () => {
      const myCallback = a => a;
      setup2 = new Setup({
        callback: myCallback,
      });
      assert.isFunction(setup2.callback);
      assert.strictEqual(setup2.callback.name, "myCallback");
    });

    it("should set overwriteConfig", () => {
      const overwriteConfig = true;
      setup2 = new Setup({
        overwriteConfig,
      });
      assert.strictEqual(setup2.overwriteConfig, !!overwriteConfig);
    });

    it("should set overwriteConfig", () => {
      const overwriteConfig = false;
      setup2 = new Setup({
        overwriteConfig,
      });
      assert.strictEqual(setup2.overwriteConfig, !!overwriteConfig);
    });
  });

  /* getters */
  describe("getters", () => {
    it("should get null", () => {
      assert.isNull(setup.browser);
    });

    it("should get string", () => {
      assert.strictEqual(setup.configPath,
                         path.join(...DIR_CONFIG, "myhost", "config"));
    });

    it("should get string", () => {
      setup2 = new Setup();
      assert.strictEqual(setup2.configPath,
                         path.join(DIR_CWD, "config"));
    });
    it("should get null", () => {
      setup2 = new Setup();
      assert.isNull(setup2.hostDescription);
    });

    it("should get hostDescription value in string", () => {
      assert.strictEqual(setup.hostDescription, "My host description");
    });

    it("should get null", () => {
      setup2 = new Setup();
      assert.isNull(setup2.hostName);
    });

    it("should get hostName value in string", () => {
      assert.strictEqual(setup.hostName, "myhost");
    });

    it("should get mainScriptFile value in string", () => {
      assert.strictEqual(setup.mainScriptFile, "index.js");
    });

    it("should get null if chromeExtensionIds arg is not given", () => {
      assert.isNull(setup.chromeExtensionIds);
    });

    it("should get null if webExtensionIds arg is not given", () => {
      assert.isNull(setup.webExtensionIds);
    });

    it("should get null if callback arg is not given", () => {
      assert.isNull(setup.callback);
    });

    it("should get false", () => {
      assert.isFalse(setup.overwriteConfig);
    });
  });

  /* setters */
  describe("setters", () => {
    it("should get null", () => {
      setup.browser = "";
      assert.isNull(setup.browser);
    });

    it("should get browser name", () => {
      setup.browser = "firefox";
      assert.strictEqual(setup.browser, "firefox");
    });

    it("should get null", () => {
      setup.browser = "foo";
      assert.isNull(setup.browser);
    });

    it("should get string", () => {
      const myPath = path.join(DIR_CWD, "foo");
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should get string", () => {
      const myPath = path.join(...DIR_CONFIG, "myhost", "config");
      setup.configPath = myPath;
      assert.strictEqual(setup.configPath, myPath);
    });

    it("should set hostDescription in given string", () => {
      setup.hostDescription = "My new host description";
      assert.strictEqual(setup.hostDescription, "My new host description");
    });

    it("should set hostName in given string", () => {
      setup.hostName = "mynewhost";
      assert.strictEqual(setup.hostName, "mynewhost");
    });

    it("should set mainScriptFile in given string", () => {
      setup.mainScriptFile = "main.js";
      assert.strictEqual(setup.mainScriptFile, "main.js");
    });

    it("should set chromeExtensionIds in given array", () => {
      setup.chromeExtensionIds = ["chrome://abc"];
      assert.deepEqual(setup.chromeExtensionIds, ["chrome://abc"]);
    });

    it("should set webExtensionIds in given array", () => {
      setup.webExtensionIds = ["myapp@webextension"];
      assert.deepEqual(setup.webExtensionIds, ["myapp@webextension"]);
    });

    it("should set callback in given function", () => {
      const myCallback = a => a;
      setup.callback = myCallback;
      assert.strictEqual(setup.callback.name, "myCallback");
    });

    it("should get true", () => {
      setup.overwriteConfig = true;
      assert.isTrue(setup.overwriteConfig);
    });

    it("should get false", () => {
      setup.overwriteConfig = false;
      assert.isFalse(setup.overwriteConfig);
    });
  });

  /* methods */
  describe("_setConfigDir", () => {
    it("should throw if dir is not given", () => {
      assert.throws(() => setup._setConfigDir(),
                    "Failed to normalize undefined");
    });

    it("should throw if dir is not subdirectory of user's home dir", () => {
      assert.throws(() => setup._setConfigDir("/foo/bar/"),
                    `Config path is not sub directory of ${DIR_HOME}.`);
    });

    it("should set array containing given path", () => {
      const configPath = path.join("foo", "bar");
      setup2 = new Setup();
      setup2._setConfigDir(configPath);
      assert.strictEqual(setup2.configPath, path.resolve(configPath));
    });
  });

  describe("run", () => {
    it("should throw", async () => {
      const readline = setupJs.__get__("readline");
      const stubCreate = sinon.stub(readline, "createInterface").callsFake(
        () => undefined
      );
      assert.throws(() => setup.run(), "Failed to run setup.");
      const {calledOnce: createCalled} = stubCreate;
      stubCreate.restore();
      assert.isTrue(createCalled);
    });

    it("should ask a question", async () => {
      let rlQues;
      const readline = setupJs.__get__("readline");
      const stubRlQues = sinon.stub().callsFake(msg => {
        rlQues = msg;
      });
      const stubCreate = sinon.stub(readline, "createInterface").returns({
        close: () => undefined,
        question: stubRlQues,
      });
      await setup.run();
      const {calledOnce: createCalled} = stubCreate;
      const {calledOnce: quesCalled} = stubRlQues;
      stubCreate.restore();
      assert.isTrue(createCalled);
      assert.isTrue(quesCalled);
      assert.include(
        rlQues,
        "Enter which browser you would like to set up the host for:\n"
      );
    });

    it("should ask a question", async () => {
      let rlQues;
      const readline = setupJs.__get__("readline");
      const stubRlQues = sinon.stub().callsFake(msg => {
        rlQues = msg;
      });
      const stubCreate = sinon.stub(readline, "createInterface").returns({
        close: () => undefined,
        question: stubRlQues,
      });
      const configPath = path.resolve(path.join("test", "file", "config"));
      setup.configPath = configPath;
      setup.browser = "firefox";
      setup.overwriteConfig = false;
      await setup.run();
      const {calledOnce: createCalled} = stubCreate;
      const {calledOnce: quesCalled} = stubRlQues;
      stubCreate.restore();
      assert.isTrue(createCalled);
      assert.isTrue(quesCalled);
      assert.include(
        rlQues,
        `${path.join(configPath, "firefox")} already exists. Overwrite? [y/n]\n`
      );
    });

    it("should call function", async () => {
      let rlQues;
      const readline = setupJs.__get__("readline");
      const stubRlClose = sinon.stub().callsFake(() => undefined);
      const stubRlQues = sinon.stub().callsFake(msg => {
        rlQues = msg;
      });
      const stubRlCreate = sinon.stub(readline, "createInterface").returns({
        close: stubRlClose,
        question: stubRlQues,
      });
      const stubSpawn = sinon.stub(childProcess, "spawn").returns({
        on: a => a,
        stderr: {
          on: a => a,
        },
      });
      const configDir = [TMPDIR, "webextmsg", "config"];
      const configPath = await createDir(configDir);
      const browserConfigPath = await createDir([...configDir, "firefox"]);
      setup.configPath = configPath;
      setup.browser = "firefox";
      setup.overwriteConfig = true;
      await Promise.all([setup.run()]).catch(e => {
      });
      const {calledOnce: createCalled} = stubRlCreate;
      const {calledOnce: closeCalled} = stubRlClose;
      const {calledOnce: quesCalled} = stubRlQues;
      stubRlCreate.restore();
      stubSpawn.restore();
      assert.isTrue(createCalled);
      assert.isTrue(closeCalled);
      assert.isFalse(quesCalled);
      assert.isUndefined(rlQues);
    });
  });
});
