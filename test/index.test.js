"use strict";
{
  const {describe, it} = require("mocha");
  const {assert} = require("chai");
  const {ChildProcess, CmdArgs, Input, Output, Setup} = require("../index");
  const {IS_BE} = require("../modules/constant");

  /* ChildProcess */
  // FIXME
  describe("ChildProcess", () => {
    const childProcess = new ChildProcess();
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
      assert.strictEqual(setup.chromeExtensionIds, null);
    });

    it("should get null if webExtensionIds is not given", () => {
      assert.strictEqual(setup.webExtensionIds, null);
    });

    it("should get null if callback is not given", () => {
      assert.strictEqual(setup.callback, null);
    });

    /* setters */
    it("should set hostDescription", () => {
      setup.hostDescription = "My new host description";
      assert.strictEqual(setup.hostDescription, "My new host description");
    });

    it("should set hostName", () => {
      setup.hostName = "mynewhost";
      assert.strictEqual(setup.hostName, "mynewhost");
    });

    it("should set mainScriptFile", () => {
      setup.mainScriptFile = "main.js";
      assert.strictEqual(setup.mainScriptFile, "main.js");
    });

    it("should set chromeExtensionIds", () => {
      setup.chromeExtensionIds = ["chrome://abc"];
      assert.deepEqual(setup.chromeExtensionIds, ["chrome://abc"]);
    });

    it("should set webExtensionIds", () => {
      setup.webExtensionIds = ["myapp@webextension"];
      assert.deepEqual(setup.webExtensionIds, ["myapp@webextension"]);
    });

    it("should set callback function", () => {
      const myCallback = () => {};
      setup.callback = myCallback;
      assert.strictEqual(typeof setup.callback, "function");
    });

    /* methods */
    // FIXME
    /*
    it("setConfigDir", () => {
    });
    */

    // FIXME
    /*
    it("run", () => {
    });
    */
  });
}
