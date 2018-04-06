"use strict";
{
  /* api */
  const {
    Setup, abortSetup, extractArg, getBrowserData,
    handleBrowserInput, handleSetupCallback, setupReadline,
  } = require("../modules/setup");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const rewire = require("rewire");
  const sinon = require("sinon");

  /* constant */
  const {DIR_HOME} = require("../modules/constant");

  const setupJs = rewire("../modules/setup");

  /* getBrowserData */
  describe("getBrowserData", () => {
    it("should get object if key matches", () => {
      assert.isObject(getBrowserData("firefox"));
    });

    it("should get object if key matches", () => {
      assert.isObject(getBrowserData("chrome"));
    });

    it("should get null if no argument", () => {
      assert.isNull(getBrowserData());
    });

    it("should get null if key does not match", () => {
      assert.isNull(getBrowserData("foo"));
    });
  });

  /* extractArg */
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

  /* abortSetup */
  describe("abort setup", () => {
    it("should exit with message", () => {
      sinon.stub(console, "info");
      sinon.stub(process, "exit");
      abortSetup("test");
      const {calledOnce: consoleCalledOnce} = console.info;
      const {calledOnce: exitCalledOnce} = process.exit;
      console.info.restore();
      process.exit.restore();
      assert.strictEqual(consoleCalledOnce, true);
      assert.strictEqual(exitCalledOnce, true);
    });
  });

  /* handleSetupCallback */
  describe("handle setup callback", () => {
    it("should call callback", () => {
      const setupVars = setupJs.__get__("vars");
      setupVars.configPath = "config";
      setupVars.manifestPath = "manifest";
      setupVars.shellPath = "shell";
      setupVars.callback = obj => {
        const {configDirPath, manifestPath, shellScriptPath} = obj;
        assert.strictEqual(configDirPath, "config");
        assert.strictEqual(shellScriptPath, "shell");
        assert.strictEqual(manifestPath, "manifest");
      };
      handleSetupCallback();
    });
  });

  describe("handle browser input", () => {
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
      it("should ask a question", () => {
        sinon.stub(setupReadline, "question");
        setup.run();
        const {calledOnce} = setupReadline.question;
        setupReadline.question.restore();
        assert.strictEqual(calledOnce, true);
      });
    });
  });
}
