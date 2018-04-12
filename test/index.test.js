"use strict";
/* api */
const {
  ChildProcess, CmdArgs, Input, Output, Setup,
  convertUriToFilePath, createDir, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir, isExecutable,
  isFile, isSubDir, readFile, removeDir,
} = require("../index");
const {assert} = require("chai");
const {describe, it} = require("mocha");

/* Classes */
describe("Classes", () => {
  it("should be instance of ChildProcess", () => {
    const childProcess = new ChildProcess();
    assert.instanceOf(childProcess, ChildProcess);
  });

  it("should be instance of CmdArgs", () => {
    const cmdArgs = new CmdArgs();
    assert.instanceOf(cmdArgs, CmdArgs);
  });

  it("should be instance of Input", () => {
    const input = new Input();
    assert.instanceOf(input, Input);
  });

  it("should be instance of Output", () => {
    const output = new Output();
    assert.instanceOf(output, Output);
  });

  it("should be instance of Setup", () => {
    const setup = new Setup();
    assert.instanceOf(setup, Setup);
  });
});

/* Functions */
describe("Functions", () => {
  it("should be type of function", () => {
    assert.typeOf(convertUriToFilePath, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(createDir, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(createFile, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(getAbsPath, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(getFileNameFromFilePath, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(getFileTimestamp, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(getStat, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(isDir, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(isExecutable, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(isFile, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(isSubDir, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(readFile, "function");
  });

  it("should be type of function", () => {
    assert.typeOf(removeDir, "function");
  });
});
