"use strict";
{
  /* api */
  const {
    ChildProcess, CmdArgs, Input, Output, Setup,
    browserData, escapeChar, getType, isString, logError, logMsg, logWarn,
    stringifyPositiveInt, stripHtmlTags, throwErr,
  } = require("../index");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  /* Classes */
  describe("Classes", () => {
    it("should be an instance of ChildProcess", () => {
      const childProcess = new ChildProcess();
      assert.instanceOf(childProcess, ChildProcess);
    });

    it("should be an instance of CmdArgs", () => {
      const cmdArgs = new CmdArgs();
      assert.instanceOf(cmdArgs, CmdArgs);
    });

    it("should be an instance of Input", () => {
      const input = new Input();
      assert.instanceOf(input, Input);
    });

    it("should be an instance of Output", () => {
      const output = new Output();
      assert.instanceOf(output, Output);
    });

    it("should be an instance of Setup", () => {
      const setup = new Setup();
      assert.instanceOf(setup, Setup);
    });
  });

  /* Data */
  describe("Data", () => {
    it("should be an object", () => {
      assert.property(browserData, "firefox");
    });
  });

  /* Functions */
  describe("Functions", () => {
    it("should be type of function", () => {
      assert.typeOf(escapeChar, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(getType, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(isString, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(logError, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(logMsg, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(logWarn, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(stringifyPositiveInt, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(stripHtmlTags, "function");
    });

    it("should be type of function", () => {
      assert.typeOf(throwErr, "function");
    });
  });
}
