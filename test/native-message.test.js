/* eslint-disable no-magic-numbers */
"use strict";
{
  /* api */
  const {Input, Output} = require("../modules/native-message");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");
  const os = require("os");

  /* constants */
  const IS_BE = os.endianness() === "BE";

  /* Input */
  describe("Input", () => {
    const input = new Input();

    it("should create an instance", async () => {
      assert.instanceOf(input, Input);
    });

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

    it("should create an instance", async () => {
      assert.instanceOf(output, Output);
    });

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
}
