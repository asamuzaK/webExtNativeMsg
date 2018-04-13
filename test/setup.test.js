"use strict";
/* api */
const {
  Setup, extractArg, getBrowserData, getBrowserConfigDir,
  handleBrowserInput, handleSetupCallback,
} = require("../modules/setup");
const {assert} = require("chai");
const {describe, it} = require("mocha");
const os = require("os");
const path = require("path");
const process = require("process");
const rewire = require("rewire");
const sinon = require("sinon");

/* constant */
const {
  CHAR, DIR_CONFIG, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN,
} = require("../modules/constant");
const DIR_CWD = process.cwd();
const HKCU_SOFTWARE = ["HKEY_CURRENT_USER", "SOFTWARE"];
const HOST_DIR_LABEL = "NativeMessagingHosts";
const OLD_CONFIG = path.join(DIR_CWD, "config");
const PERM_DIR = 0o700;
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

const setupJs = rewire("../modules/setup");

describe("abortSetup", () => {
  it("should exit with message", () => {
    let info;
    const func = setupJs.__get__("abortSetup");
    const stubExit = sinon.stub(process, "exit");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      info = msg;
    });
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const vars = setupJs.__set__("vars", {
      rl: {
        close: stubRlClose,
      },
    });
    func("test");
    const {calledOnce: infoCalled} = stubInfo;
    const {calledOnce: exitCalled} = stubExit;
    const {calledOnce: closeCalled} = stubRlClose;
    stubInfo.restore();
    stubExit.restore();
    assert.isTrue(infoCalled);
    assert.isTrue(exitCalled);
    assert.isTrue(closeCalled);
    assert.strictEqual(info, "Setup aborted: test");
    vars();
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
  it("should get null", () => {
    assert.isNull(getBrowserConfigDir());
  });

  it("should get dir", () => {
    const func = setupJs.__get__("getBrowserConfigDir");
    const vars = setupJs.__set__("vars", {
      browser: {
        alias: "firefox",
      },
      configDir: [TMPDIR],
    });
    const res = func();
    assert.isTrue(Array.isArray(res));
    assert.deepEqual(res, [TMPDIR, "firefox"]);
    vars();
  });
});

describe("handleSetupCallback", () => {
  it("should get null", () => {
    assert.isNull(handleSetupCallback());
  });

  it("should call callback", () => {
    const func = setupJs.__get__("handleSetupCallback");
    const vars = setupJs.__set__("vars", {
      configPath: "config",
      manifestPath: "manifest",
      shellPath: "shell",
      callback: obj => obj,
    });
    const res = func();
    assert.deepEqual(res, {
      configDirPath: "config",
      manifestPath: "manifest",
      shellScriptPath: "shell",
    });
    vars();
  });
});

describe("handleOldConfig", () => {
  it("should get function", () => {
    const func = setupJs.__get__("handleOldConfig");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const vars = setupJs.__set__("vars", {
      rl: {
        close: stubRlClose,
      },
    });
    const handleSetupCb = setupJs.__set__("handleSetupCallback", () => true);
    const res = func();
    const {calledOnce: closeCalled} = stubRlClose;
    assert.isTrue(closeCalled);
    assert.isTrue(res);
    vars();
    handleSetupCb();
  });

  it("should get function", () => {
    const func = setupJs.__get__("handleOldConfig");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const vars = setupJs.__set__("vars", {
      rl: {
        close: stubRlClose,
      },
    });
    const stubRemDir = sinon.stub().callsFake(() => undefined);
    const removeDir = setupJs.__set__("removeDir", stubRemDir);
    const handleSetupCb = setupJs.__set__("handleSetupCallback", () => true);
    const res = func("yes");
    const {calledOnce: remDirCalled} = stubRemDir;
    const {calledOnce: closeCalled} = stubRlClose;
    assert.isTrue(remDirCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(res);
    vars();
    removeDir();
    handleSetupCb();
  });

  it("should get function", () => {
    const func = setupJs.__get__("handleOldConfig");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRemDir = sinon.stub().callsFake(() => {
      throw new Error("error test");
    });
    const stubLogErr = sinon.stub().callsFake(() => undefined);
    const vars = setupJs.__set__("vars", {
      rl: {
        close: stubRlClose,
      },
    });
    const removeDir = setupJs.__set__("removeDir", stubRemDir);
    const logErr = setupJs.__set__("logErr", stubLogErr);
    const handleSetupCb = setupJs.__set__("handleSetupCallback", () => true);
    const res = func("yes");
    const {calledOnce: remDirCalled} = stubRemDir;
    const {calledOnce: logErrCalled} = stubLogErr;
    const {calledOnce: closeCalled} = stubRlClose;
    assert.isTrue(remDirCalled);
    assert.isTrue(logErrCalled);
    assert.isTrue(closeCalled);
    assert.isTrue(res);
    removeDir();
    logErr();
    handleSetupCb();
    vars();
  });
});

describe("checkOldConfig", () => {
  it("should not ask question", () => {
    const func = setupJs.__get__("checkOldConfig");
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubSetupCb = sinon.stub().callsFake(() => undefined);
    const vars = setupJs.__set__("vars", {
      rl: {
        close: stubRlClose,
      },
    });
    const handleSetupCb = setupJs.__set__("handleSetupCallback", stubSetupCb);
    func();
    const {calledOnce: closeCalled} = stubRlClose;
    const {calledOnce: setupCbCalled} = stubSetupCb;
    assert.isTrue(closeCalled);
    assert.isTrue(setupCbCalled);
    handleSetupCb();
    vars();
  });

  it("should ask question", () => {
    const func = setupJs.__get__("checkOldConfig");
    const configDir = path.resolve(path.join("test", "file"));
    const oldConfigDir = path.join(configDir, "config");
    let quesMsg;
    const stubRlClose = sinon.stub().callsFake(() => undefined);
    const stubRlQues = sinon.stub().callsFake(msg => {
      quesMsg = msg;
    });
    const stubSetupCb = sinon.stub().callsFake(() => undefined);
    const oldConfig = setupJs.__set__("OLD_CONFIG", oldConfigDir);
    const vars = setupJs.__set__("vars", {
      configDir: [configDir],
      rl: {
        close: stubRlClose,
        question: stubRlQues,
      },
    });
    const handleSetupCb = setupJs.__set__("handleSetupCallback", stubSetupCb);
    func();
    const {calledOnce: rlCloseCalled} = stubRlClose;
    const {calledOnce: rlQuesCalled} = stubRlQues;
    const {calledOnce: setupCbCalled} = stubSetupCb;
    assert.isFalse(rlCloseCalled);
    assert.isTrue(rlQuesCalled);
    assert.isFalse(setupCbCalled);
    assert.strictEqual(
      quesMsg,
      `Found old config directory ${oldConfigDir}. Remove? [y/n]\n`
    );
    handleSetupCb();
    oldConfig();
    vars();
  });
});

describe("createConfig", () => {
  it("should throw", async () => {
    const func = setupJs.__get__("createConfig");
    await func().catch(e => {
      assert.strictEqual(e.message, "Expected Array but got Null.");
    });
  });

  it("should get path", async () => {
    const func = setupJs.__get__("createConfig");
    let infoMsg;
    const dirPath = path.join(TMPDIR, "firefox");
    const removeDir = setupJs.__get__("removeDir");
    const stubInfo = sinon.stub(console, "info").callsFake(msg => {
      infoMsg = msg;
    });
    const vars = setupJs.__set__("vars", {
      browser: {
        alias: "firefox",
      },
      configDir: [TMPDIR],
    });
    const res = await func();
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
    const func = setupJs.__get__("createShellScript");
    await func().catch(e => {
      assert.strictEqual(e.message, "No such directory: undefined.");
    });
  });

  it("should throw", async () => {
    const func = setupJs.__get__("createShellScript");
    await func("foo/bar").catch(e => {
      assert.strictEqual(e.message, "No such directory: foo/bar.");
    });
  });

  it("should throw", async () => {
    const func = setupJs.__get__("createShellScript");
    const vars = setupJs.__set__("vars", {
      hostName: null,
      mainFile: "foo",
    });
    await func(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const func = setupJs.__get__("createShellScript");
    const vars = setupJs.__set__("vars", {
      hostName: "foo",
      mainFile: null,
    });
    await func(TMPDIR).catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should get path", async () => {
    const func = setupJs.__get__("createShellScript");
    const configDir = [TMPDIR, "firefox", "config"];
    const createDir = setupJs.__get__("createDir");
    const removeDir = setupJs.__get__("removeDir");
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
    const res = await func(configPath);
    stubInfo.restore();
    assert.strictEqual(res, shellPath);
    assert.strictEqual(infoMsg, `Created: ${shellPath}`);
    vars();
    removeDir(path.join(TMPDIR, "firefox"), TMPDIR);
  });
});

describe("createFiles", () => {
  it("should throw", async () => {
    const func = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: null,
    });
    await func().catch(e => {
      assert.strictEqual(e.message, "Expected Object but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const func = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: {},
      hostDesc: null,
    });
    await func().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });

  it("should throw", async () => {
    const func = setupJs.__get__("createFiles");
    const vars = setupJs.__set__("vars", {
      browser: {},
      hostDesc: "foo",
      hostName: null,
    });
    await func().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Null.");
    });
    vars();
  });
});

// TODO:
describe("handleBrowserInput", () => {
  it("should abort", () => {
    sinon.stub(process, "exit");
    sinon.stub(console, "info");
    handleBrowserInput();
    const {calledOnce: consoleCalledOnce} = console.info;
    const {calledOnce: exitCalledOnce} = process.exit;
    console.info.restore();
    process.exit.restore();
    assert.strictEqual(consoleCalledOnce, true);
    assert.strictEqual(exitCalledOnce, true);
  });

  it("should abort", () => {
    sinon.stub(process, "exit");
    sinon.stub(console, "info");
    handleBrowserInput("foo");
    const {calledOnce: consoleCalledOnce} = console.info;
    const {calledOnce: exitCalledOnce} = process.exit;
    console.info.restore();
    process.exit.restore();
    assert.strictEqual(consoleCalledOnce, true);
    assert.strictEqual(exitCalledOnce, true);
  });

  it("should abort", () => {
    sinon.stub(process, "exit");
    sinon.stub(console, "info");
    handleBrowserInput("");
    const {calledOnce: consoleCalledOnce} = console.info;
    const {calledOnce: exitCalledOnce} = process.exit;
    console.info.restore();
    process.exit.restore();
    assert.strictEqual(consoleCalledOnce, true);
    assert.strictEqual(exitCalledOnce, true);
  });

  it("should get function", async () => {
    const func = setupJs.__get__("handleBrowserInput");
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
    const res = await func("firefox");
    const {called} = stubAbort;
    assert.isTrue(res);
    assert.isFalse(called);
    abortSetup();
    createFiles();
    vars();
  });
});

describe("extractArg", () => {
  it("should get value", () => {
    assert.strictEqual(
      extractArg("--app-file=index.exe", /^--app-file=(.+)$/i),
      "index.exe"
    );
  });

  it("should get value", () => {
    assert.strictEqual(
      extractArg("--browser=firefox", /^--browser=(.+)$/i),
      "firefox"
    );
  });

  it("should get value", () => {
    assert.strictEqual(
      extractArg("--config-path=\"C:\\Program Files\"",
                 /^--config-path=(.+)$/i),
      "\"C:\\Program Files\""
    );
  });
});

/* Setup */
describe("Setup", () => {
  const setup = new Setup({
    hostDescription: "My host description",
    hostName: "myhost",
  });

  it("should create an instance", () => {
    assert.instanceOf(setup, Setup);
  });

  /* getters */
  describe("getters", () => {
    it("should get hostDescription value in string", () => {
      assert.strictEqual(setup.hostDescription, "My host description");
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
  });

  /* setters */
  describe("setters", () => {
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
  });

  /* methods */
  describe("setConfigDir", () => {
    it("should throw if dir is not given", () => {
      assert.throws(() => setup.setConfigDir(),
                    "Failed to normalize undefined");
    });

    it("should throw if dir is not subdirectory of user's home dir", () => {
      assert.throws(() => setup.setConfigDir("/foo/bar/"),
                    `Config path is not sub directory of ${DIR_HOME}.`);
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
      const stubCreate = sinon.stub(readline, "createInterface").callsFake(
        () => {
          const rl = {
            close: () => undefined,
            question: stubRlQues,
          };
          return rl;
        }
      );
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
  });
});
