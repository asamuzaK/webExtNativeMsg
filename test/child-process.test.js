/* eslint-disable max-nested-callbacks */
"use strict";
{
  /* api */
  const {ChildProcess, CmdArgs} = require("../modules/child-process");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const fs = require("fs");
  const os = require("os");
  const path = require("path");

  /* constants */
  const IS_WIN = os.platform() === "win32";
  const PERM_EXEC = 0o700;

  /* ChildProcess */
  describe("ChildProcess", () => {
    it("should create an instance", () => {
      const childProcess = new ChildProcess();
      assert.instanceOf(childProcess, ChildProcess);
    });

    /* method */
    describe("spawn", () => {
      it("should throw if given command is not executable", async () => {
        await (new ChildProcess()).spawn().catch(e => {
          assert.strictEqual(e.message, "null is not executable.");
        });
      });

      it("should spawn child process", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test.cmd") ||
          path.join("test", "file", "test.sh")
        );
        await fs.chmodSync(app, PERM_EXEC);
        const proc = await (new ChildProcess(app)).spawn();
        proc.on("close", code => {
          assert.strictEqual(code, 0);
        });
      });
    });
  });

  /* CmdArgs */
  describe("CmdArgs", () => {
    const cmdArgs = new CmdArgs("-a -b \"c d\"");

    it("should create an instance", () => {
      assert.instanceOf(cmdArgs, CmdArgs);
    });

    /* methods */
    describe("toArray", () => {
      it("should get arguments in array", () => {
        assert.deepEqual(cmdArgs.toArray(), ["-a", "-b", "c d"]);
      });
    });

    describe("toString", () => {
      it("should get arguments in string", () => {
        assert.strictEqual(cmdArgs.toString(), "-a -b \"c d\"");
      });
    });
  });
}
