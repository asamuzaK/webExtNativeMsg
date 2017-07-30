/* eslint-disable no-magic-numbers */
"use strict";
{
  /* api */
  const {ChildProcess, CmdArgs, Input, Output, Setup} = require("../index");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const fs = require("fs");
  const os = require("os");
  const path = require("path");

  /* constants */
  const DIR_HOME = os.homedir();
  const IS_BE = os.endianness() === "BE";
  const IS_WIN = os.platform() === "win32";
  const PERM_EXEC = 0o700;

  /* ChildProcess */
  describe("ChildProcess", () => {
    it("should throw if given command is not executable", async () => {
      await (new ChildProcess()).spawn().catch(e => {
        assert.strictEqual(e.message, "null is not executable.");
      });
    });

    it("should exit with 0", async () => {
      const app = path.resolve(IS_WIN && path.join("test", "bin", "test.cmd") ||
                               path.join("test", "bin", "test.sh"));
      await fs.chmodSync(app, PERM_EXEC);
      const proc = await (new ChildProcess(app)).spawn();
      proc.on("close", code => {
        assert.strictEqual(code, 0);
      });
    });
  });

  /* CmdArgs */
  describe("CmdArgs", () => {
    const cmdArgs = new CmdArgs("-a -b \"c d\"");

    /* methods */
    it("should get arguments in array", () => {
      assert.deepEqual(cmdArgs.toArray(), ["-a", "-b", "c d"]);
    });

    it("should get arguments in string", () => {
      assert.strictEqual(cmdArgs.toString(), "-a -b \"c d\"");
    });
  });

  /* Input */
  describe("Input", () => {
    const input = new Input();

    /* method */
    it("should decode buffer to array of message", () => {
      if (IS_BE) {
        assert.deepEqual(
          input.decode(Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])),
          ["test"]
        );
      } else {
        assert.deepEqual(
          input.decode(Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])),
          ["test"]
        );
      }
    });
  });

  /* Output */
  describe("Output", () => {
    const output = new Output();

    /* method */
    it("should encode message to buffer", () => {
      if (IS_BE) {
        assert.deepEqual(
          output.encode("test"),
          Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])
        );
      } else {
        assert.deepEqual(
          output.encode("test"),
          Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])
        );
      }
    });
  });

  /* Setup */
  describe("Setup", () => {
    const setup = new Setup({
      hostDescription: "My host description",
      hostName: "myhost",
    });

    /* getters */
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
      assert.isNull(setup.chromeExtensionIds, null);
    });

    it("should get null if webExtensionIds arg is not given", () => {
      assert.isNull(setup.webExtensionIds, null);
    });

    it("should get null if callback arg is not given", () => {
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

    it(
      "should throw if setConfigDir dir is not subdirectory of user's home dir",
      () => {
        try {
          setup.setConfigDir("/foo/bar/");
        } catch (e) {
          assert.strictEqual(
            e.message, `Config path is not sub directory of ${DIR_HOME}.`
          );
        }
      }
    );

    // FIXME: add test for setup.run()
    /*
    it("run", () => {
    });
    */
  });
}
