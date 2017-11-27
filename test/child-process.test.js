/* eslint-disable max-nested-callbacks, no-magic-numbers */
"use strict";
{
  /* api */
  const {ChildProcess, CmdArgs} = require("../modules/child-process");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const sinon = require("sinon");
  const childProcess = require("child_process");
  const fs = require("fs");
  const path = require("path");

  /* constants */
  const {IS_WIN} = require("../modules/constant");
  const PERM_EXEC = 0o700;
  const PERM_FILE = 0o600;

  /* ChildProcess */
  describe("ChildProcess", () => {
    it("should create an instance", () => {
      const proc = new ChildProcess();
      assert.instanceOf(proc, ChildProcess);
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

      it("should spawn child process", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test 2.cmd") ||
          path.join("test", "file", "test 2.sh")
        );
        await fs.chmodSync(app, PERM_EXEC);
        const proc = await (new ChildProcess(app)).spawn();
        proc.on("close", code => {
          assert.strictEqual(code, 0);
        });
      });

      it("should spawn with file path as first argument", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test.cmd") ||
          path.join("test", "file", "test.sh")
        );
        const file = path.resolve(path.join("test", "file", "test.txt"));
        await fs.chmodSync(app, PERM_EXEC);
        await fs.chmodSync(file, PERM_FILE);
        const stub = sinon.stub(childProcess, "spawn").callsFake((...args) => {
          const [, cmdArgs] = args;
          const [filePath] = cmdArgs;
          assert.strictEqual(cmdArgs.length, 1);
          assert.strictEqual(filePath, file);
        });
        await (new ChildProcess(app)).spawn(file);
        stub.restore();
      });

      it("should spawn with file path as first argument", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test.cmd") ||
          path.join("test", "file", "test.sh")
        );
        const file = path.resolve(path.join("test", "file", "test.txt"));
        await fs.chmodSync(app, PERM_EXEC);
        await fs.chmodSync(file, PERM_FILE);
        const stub = sinon.stub(childProcess, "spawn").callsFake((...args) => {
          const [, cmdArgs] = args;
          const [filePath] = cmdArgs;
          assert.strictEqual(cmdArgs.length, 1);
          assert.strictEqual(filePath, file);
        });
        await (new ChildProcess(app)).spawn(file, true);
        stub.restore();
      });

      it("should spawn with file path as first argument", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test.cmd") ||
          path.join("test", "file", "test.sh")
        );
        const arg = ["-a", "-b"];
        const file = path.resolve(path.join("test", "file", "test.txt"));
        await fs.chmodSync(app, PERM_EXEC);
        await fs.chmodSync(file, PERM_FILE);
        const stub = sinon.stub(childProcess, "spawn").callsFake((...args) => {
          const [, cmdArgs] = args;
          const [arg1, arg2, arg3] = cmdArgs;
          assert.strictEqual(cmdArgs.length, 3);
          assert.strictEqual(arg1, file);
          assert.strictEqual(arg2, "-a");
          assert.strictEqual(arg3, "-b");
        });
        await (new ChildProcess(app, arg)).spawn(file);
        stub.restore();
      });

      it("should spawn with file path as last argument", async () => {
        const app = path.resolve(
          IS_WIN && path.join("test", "file", "test.cmd") ||
          path.join("test", "file", "test.sh")
        );
        const arg = ["-a", "-b"];
        const file = path.resolve(path.join("test", "file", "test.txt"));
        await fs.chmodSync(app, PERM_EXEC);
        await fs.chmodSync(file, PERM_FILE);
        const stub = sinon.stub(childProcess, "spawn").callsFake((...args) => {
          const [, cmdArgs] = args;
          const [arg1, arg2, arg3] = cmdArgs;
          assert.strictEqual(cmdArgs.length, 3);
          assert.strictEqual(arg1, "-a");
          assert.strictEqual(arg2, "-b");
          assert.strictEqual(arg3, file);
        });
        await (new ChildProcess(app, arg)).spawn(file, true);
        stub.restore();
      });
    });
  });

  /* CmdArgs */
  describe("CmdArgs", () => {
    const cmdStr = new CmdArgs("-a -b \"c d\"");
    const cmdArr = new CmdArgs(["-a", "-b", "c d"]);

    it("should create an instance", () => {
      assert.instanceOf(cmdStr, CmdArgs);
    });

    it("should create an instance", () => {
      assert.instanceOf(cmdArr, CmdArgs);
    });

    /* methods */
    describe("toArray", () => {
      it("should get arguments in array", () => {
        assert.deepEqual(cmdStr.toArray(), ["-a", "-b", "c d"]);
      });

      it("should get arguments in array", () => {
        assert.deepEqual(cmdArr.toArray(), ["-a", "-b", "c d"]);
      });
    });

    describe("toString", () => {
      it("should get arguments in string", () => {
        assert.strictEqual(cmdStr.toString(), "-a -b \"c d\"");
      });

      it("should get arguments in string", () => {
        assert.strictEqual(cmdArr.toString(), "-a -b \"c d\"");
      });
    });
  });
}
