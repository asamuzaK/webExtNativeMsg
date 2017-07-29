"use strict";
{
  const {describe, it} = require("mocha");
  const {assert} = require("chai");
  const {ChildProcess, CmdArgs, Input, Output, Setup} = require("../index");
  const {DIR_HOME, IS_BE} = require("../modules/constant");

  /* ChildProcess */
  describe("ChildProcess", () => {
    const childProcess = new ChildProcess();
    it("should throw if given command is not executable", async () => {
      await childProcess.spawn().catch(e => {
        assert.equal(e.message, "null is not executable.");
      });
    });
    // FIXME: add test for childProcess.spawn() which passes
    /*
    it("should pass", async () => {});
    */
  });

  /* CmdArgs */
  describe("CmdArgs", () => {
    const cmdArgs = new CmdArgs("-a -b \"c d\"");

    /* methods */
    it("should get arguments in array", () => {
      assert.deepEqual(cmdArgs.toArray(), ["-a", "-b", "c d"]);
    });

    it("should get arguments in string", () => {
      assert.deepEqual(cmdArgs.toString(), "-a -b \"c d\"");
    });
  });

  /* Input */
  describe("Input", () => {
    const BYTE_LEN = 4;
    const input = new Input();

    /* method */
    it("should decode buffer to array of message", () => {
      const buf = Buffer.from(JSON.stringify("test"));
      const len = Buffer.alloc(BYTE_LEN);
      IS_BE && len.writeUIntBE(buf.length, 0, BYTE_LEN) ||
      len.writeUIntLE(buf.length, 0, BYTE_LEN);
      assert.deepEqual(input.decode(Buffer.concat([len, buf])), ["test"]);
    });
  });

  /* Output */
  describe("Output", () => {
    const BYTE_LEN = 4;
    const output = new Output();

    /* method */
    it("should encode message to buffer", () => {
      const buf = Buffer.from(JSON.stringify("test"));
      const len = Buffer.alloc(BYTE_LEN);
      IS_BE && len.writeUIntBE(buf.length, 0, BYTE_LEN) ||
      len.writeUIntLE(buf.length, 0, BYTE_LEN);
      assert.deepEqual(output.encode("test"), Buffer.concat([len, buf]));
    });
  });

  /* Setup */
  describe("Setup", () => {
    const setup = new Setup({
      hostDescription: "My host description",
      hostName: "myhost",
    });

    /* getters */
    it("should get hostDescription in string", () => {
      assert.strictEqual(setup.hostDescription, "My host description");
    });

    it("should get hostName in string", () => {
      assert.strictEqual(setup.hostName, "myhost");
    });

    it("should get mainScriptFile in string", () => {
      assert.strictEqual(setup.mainScriptFile, "index.js");
    });

    it("should get null if chromeExtensionIds is not given", () => {
      assert.isNull(setup.chromeExtensionIds, null);
    });

    it("should get null if webExtensionIds is not given", () => {
      assert.isNull(setup.webExtensionIds, null);
    });

    it("should get null if callback is not given", () => {
      assert.isNull(setup.callback, null);
    });

    /* setters */
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

    /* methods */
    it("should throw if setConfigDir dir is not given", () => {
      try {
        setup.setConfigDir();
      } catch (e) {
        assert.strictEqual(e.message, "Failed to normalize undefined");
      }
    });

    it("should throw if setConfigDir dir is not subdirectory of user's home",
       () => {
         try {
           setup.setConfigDir("/foo/bar/");
         } catch (e) {
           assert.strictEqual(
             e.message, `Config path is not sub directory of ${DIR_HOME}.`
           );
         }
       });

    // FIXME: add test for run()
    /*
    it("run", () => {
    });
    */
  });
}
