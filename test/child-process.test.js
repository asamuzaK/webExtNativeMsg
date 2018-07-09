/* eslint-disable max-nested-callbacks, no-magic-numbers */
"use strict";
/* api */
const {ChildProcess, CmdArgs} = require("../modules/child-process");
const {assert} = require("chai");
const {describe, it} = require("mocha");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const process = require("process");
const rewire = require("rewire");
const sinon = require("sinon");

const childProc = rewire("../modules/child-process");

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

  /* constructor */
  it("should set cmd", () => {
    const app = IS_WIN && "test.cmd" || "test.sh";
    const cmd = path.resolve(path.join("test", "file", app));
    const proc = new ChildProcess(cmd);
    assert.deepEqual(proc._cmd, cmd);
  });

  it("should set args", () => {
    const args = ["foo", "bar"];
    const proc = new ChildProcess(null, args);
    assert.deepEqual(proc._args, args);
  });

  it("should set args", () => {
    const args = "foo bar";
    const proc = new ChildProcess(null, args);
    assert.deepEqual(proc._args, args.split(" "));
  });

  it("should set option", () => {
    const opt = {cwd: null, env: process.env, encoding: "utf8"};
    const proc = new ChildProcess(null, null, opt);
    assert.deepEqual(proc._opt, opt);
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
      const {calledOnce} = stub;
      stub.restore();
      assert.isTrue(calledOnce);
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
      const {calledOnce} = stub;
      stub.restore();
      assert.isTrue(calledOnce);
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
      const {calledOnce} = stub;
      stub.restore();
      assert.isTrue(calledOnce);
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
      const {calledOnce} = stub;
      stub.restore();
      assert.isTrue(calledOnce);
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

describe("correctArg", () => {
  it("should get empty string", () => {
    const correctArg = childProc.__get__("correctArg");
    const res = correctArg();
    assert.strictEqual(res, "");
  });

  it("should get string", () => {
    const correctArg = childProc.__get__("correctArg");
    const res = correctArg("-a -b");
    assert.strictEqual(res, "-a -b");
  });

  it("should trim and/or strip quotes", () => {
    const correctArg = childProc.__get__("correctArg");
    const res = correctArg(" \"test\" ");
    assert.strictEqual(res, "test");
  });

  it("should strip back slash", () => {
    const correctArg = childProc.__get__("correctArg");
    const res = correctArg("te\\st");
    assert.strictEqual(res, "test");
  });

  it("should strip quotes", () => {
    const correctArg = childProc.__get__("correctArg");
    const res = correctArg("test \"foo bar\"");
    assert.strictEqual(res, "test foo bar");
  });
});

describe("extractArg", () => {
  it("should get empty array if argument not given", () => {
    const extractArg = childProc.__get__("extractArg");
    const res = extractArg();
    assert.isTrue(Array.isArray(res));
    assert.strictEqual(res.length, 0);
  });

  it("should get empty array if argument is not string", () => {
    const extractArg = childProc.__get__("extractArg");
    const res = extractArg(1);
    assert.isTrue(Array.isArray(res));
    assert.strictEqual(res.length, 0);
  });

  it("should get array in expected length", () => {
    const extractArg = childProc.__get__("extractArg");
    const EXPECTED_LENGTH = 2;
    const res = extractArg("foo bar\\baz");
    assert.isTrue(Array.isArray(res));
    assert.strictEqual(res.length, EXPECTED_LENGTH);
    assert.deepEqual(res, [
      "foo",
      "bar\\baz",
    ]);
  });
});

describe("stringifyArg", () => {
  it("should get empty string if no argument given", () => {
    const stringifyArg = childProc.__get__("stringifyArg");
    assert.strictEqual(stringifyArg(), "");
  });

  it("should get empty string if argument is not string", () => {
    const stringifyArg = childProc.__get__("stringifyArg");
    assert.strictEqual(stringifyArg(1), "");
  });

  it("should get string", () => {
    const stringifyArg = childProc.__get__("stringifyArg");
    assert.strictEqual(stringifyArg("foo \"bar baz\" qux\\quux"),
                       "\"foo \\\"bar baz\\\" qux\\\\quux\"");
  });
});
