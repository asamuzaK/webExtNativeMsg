// FIXME
/* eslint-disable no-unused-vars */
"use strict";
{
  /* api */
  const {
    convUriToFilePath, createDir, createFile, getAbsPath,
    getFileNameFromFilePath, getFileTimestamp, getStat, isDir,
    isExecutable, isFile, isSubDir, removeDir, readFile,
  } = require("../modules/file-util");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const process = require("process");

  /* constants */
  const IS_WIN = os.platform() === "win32";
  const PERM_EXEC = 0o700;

  describe("convUriToFilePath", () => {
    it("should get string", () => {
      const uri = "file:///test.txt";
      assert.strictEqual(convUriToFilePath(uri), "test.txt");
    });

    it("should throw if string is not given", () => {
      assert.throws(() => convUriToFilePath(),
                    "Expected String but got Undefined");
    });

    it("should get null if protocol does not match", () => {
      const uri = "http://example.com";
      assert.isNull(convUriToFilePath(uri));
    });
  });

  // FIXME:
  /*
  describe("createDir", () => {
  });

  describe("createFile", () => {
  });
  */

  describe("getAbsPath", () => {
    it("should get string", () => {
      const p = "test.txt";
      const n = path.resolve(p);
      assert.strictEqual(getAbsPath(p), n);
    });

    it("should get null if string is not given", () => {
      assert.isNull(getAbsPath());
    });
  });

  describe("getFileNameFromFilePath", () => {
    it("should get string", () => {
      const p = path.resolve(path.join("test", "file", "test.sh"));
      assert.strictEqual(getFileNameFromFilePath(p), "test");
    });

    it("should get default string", () => {
      const p = path.resolve(path.join("test", "file"));
      assert.strictEqual(getFileNameFromFilePath(p), "index");
    });
  });

  describe("getFileTimestamp", () => {
    it("should get positive integer", () => {
      const p = path.resolve(path.join("test", "file", "test.sh"));
      assert.isAbove(getFileTimestamp(p), 0);
    });

    it("should get 0 if file does not exist", () => {
      const p = path.resolve(path.join("test", "file", "foo.txt"));
      assert.strictEqual(getFileTimestamp(p), 0);
    });
  });

  describe("getStat", () => {
    it("should be an object", () => {
      const p = path.resolve(path.join("test", "file", "test.sh"));
      assert.property(getStat(p), "mode");
    });

    it("should get null if given argument is not string", () => {
      assert.isNull(getStat());
    });

    it("should get null if file does not exist", () => {
      const p = path.resolve(path.join("test", "file", "foo.txt"));
      assert.isNull(getStat(p));
    });
  });

  describe("isDir", () => {
    it("should get true if dir exists", () => {
      const p = path.resolve(path.join("test", "file"));
      assert.strictEqual(isDir(p), true);
    });

    it("should get false if dir does not exist", () => {
      const p = path.resolve(path.join("test", "foo"));
      assert.strictEqual(isDir(p), false);
    });
  });

  describe("isExecutable", () => {
    it("should get true if file is executable", () => {
      const p = path.resolve(
        IS_WIN && path.join("test", "file", "test.cmd") ||
        path.join("test", "file", "test.sh")
      );
      fs.chmodSync(p, PERM_EXEC);
      assert.strictEqual(isExecutable(p), true);
    });

    it("should get false if file is not executable", () => {
      const p = path.resolve(path.join("test", "file", "test.txt"));
      assert.strictEqual(isExecutable(p), false);
    });
  });

  describe("isFile", () => {
    it("should get true if file exists", () => {
      const p = path.resolve(path.join("test", "file", "test.txt"));
      assert.strictEqual(isFile(p), true);
    });

    it("should get false if file does not exist", () => {
      const p = path.resolve(path.join("test", "file", "foo.txt"));
      assert.strictEqual(isFile(p), false);
    });
  });

  describe("isSubDir", () => {
    it("should get true if dir is subdirectory of base dir", () => {
      const d = path.resolve(path.join("test", "file"));
      const b = path.resolve("test");
      assert.strictEqual(isSubDir(d, b), true);
    });

    it("should get false if dir is not subdirectory of base dir", () => {
      const d = path.resolve("foo");
      const b = path.resolve("test");
      assert.strictEqual(isSubDir(d, b), false);
    });
  });

  // FIXME:
  /*
  describe("removeDir", () => {
  });
  */

  describe("readFile", () => {
    it("should get file", async () => {
      const p = path.resolve(path.join("test", "file", "test.txt"));
      const opt = {encoding: "utf8", flag: "r"};
      const file = await readFile(p, opt).catch(e => {
        throw e;
      });
      assert.strictEqual(file, "test file\n");
    });
  });
}
