"use strict";
{
  /* api */
  const {
    ChildProcess, CmdArgs, Input, Output, Setup,
    browserData, escapeChar, getType, isString, logError, logMsg, logWarn,
    stringifyPositiveInt, stripHtmlTags, throwErr,
    CHAR, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_BE, IS_LE, IS_MAC, IS_WIN,
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

  describe("Constants", () => {
    it("should be string", () => {
      assert.isString(CHAR);
    });

    it("should be string", () => {
      assert.isString(DIR_HOME);
    });

    it("should be string", () => {
      assert.isString(EXT_CHROME);
    });

    it("should be string", () => {
      assert.isString(EXT_WEB);
    });

    it("should be finite", () => {
      assert.isFinite(INDENT);
    });

    it("should be boolean", () => {
      assert.isBoolean(IS_BE);
    });

    it("should be boolean", () => {
      assert.isBoolean(IS_LE);
    });

    it("should be boolean", () => {
      assert.isBoolean(IS_MAC);
    });

    it("should be boolean", () => {
      assert.isBoolean(IS_WIN);
    });
  });
}
