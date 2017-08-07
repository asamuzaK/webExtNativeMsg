"use strict";
{
  /* api */
  const {
    ChildProcess, CmdArgs, Input, Output, Setup,
    browserData,
  } = require("../index");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  /* Classes */
  describe("Classes", () => {
    it("should create an instance of ChildProcess", async () => {
      const childProcess = new ChildProcess();
      assert.instanceOf(childProcess, ChildProcess);
    });

    it("should create an instance of CmdArgs", async () => {
      const cmdArgs = new CmdArgs();
      assert.instanceOf(cmdArgs, CmdArgs);
    });

    it("should create an instance of Input", async () => {
      const input = new Input();
      assert.instanceOf(input, Input);
    });

    it("should create an instance of Output", async () => {
      const output = new Output();
      assert.instanceOf(output, Output);
    });

    it("should create an instance of Setup", async () => {
      const setup = new Setup();
      assert.instanceOf(setup, Setup);
    });
  });

  /* Static Data */
  describe("Static Data", () => {
    it("should get browser data object", async () => {
      assert.property(browserData, "firefox");
    });
  });
}
