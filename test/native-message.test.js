/* eslint-disable no-magic-numbers */
"use strict";
/* api */
const {Input, Output} = require("../modules/native-message");
const {assert} = require("chai");
const {describe, it} = require("mocha");

/* constant */
const {IS_BE} = require("../modules/constant");

/* Input */
describe("Input", () => {
  it("should create an instance", () => {
    const input = new Input();
    assert.instanceOf(input, Input);
  });
});

/* method */
describe("decode", () => {
  it("should get null", () => {
    const input = new Input();
    assert.isNull(input.decode());
  });

  it("should get null", () => {
    const input = new Input();
    assert.isNull(input.decode(Buffer.alloc(0)));
  });

  it("should get null", () => {
    const input = new Input();
    assert.isNull(input.decode(Buffer.alloc(4)));
  });

  it("should decode buffer to array of message", () => {
    const input = new Input();
    if (IS_BE) {
      assert.deepEqual(
        input.decode(Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])),
        ["test"],
      );
    } else {
      assert.deepEqual(
        input.decode(Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])),
        ["test"],
      );
    }
  });

  it("should decode buffer to array of message", () => {
    const input = new Input();
    if (IS_BE) {
      const msg1 = input.decode(Buffer.from([0, 0, 0, 6]));
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.isNull(msg1);
      assert.deepEqual(msg2, ["test"]);
    } else {
      const msg1 = input.decode(Buffer.from([6, 0, 0, 0]));
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.isNull(msg1);
      assert.deepEqual(msg2, ["test"]);
    }
  });

  it("should decode buffer to array of message", () => {
    const input = new Input();
    if (IS_BE) {
      const msg1 = input.decode(
        Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34, 0, 0, 0, 6]),
      );
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, ["test"]);
      assert.deepEqual(msg2, ["test"]);
    } else {
      const msg1 = input.decode(
        Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34, 6, 0, 0, 0]),
      );
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, ["test"]);
      assert.deepEqual(msg2, ["test"]);
    }
  });

  it("should decode buffer to array of message", () => {
    const input = new Input();
    if (IS_BE) {
      const msg = input.decode(Buffer.from([
        0, 0, 0, 6, 34, 116, 101, 115, 116, 34,
        0, 0, 0, 6, 34, 116, 101, 115, 116, 34,
      ]));
      assert.deepEqual(msg, ["test", "test"]);
    } else {
      const msg = input.decode(Buffer.from([
        6, 0, 0, 0, 34, 116, 101, 115, 116, 34,
        6, 0, 0, 0, 34, 116, 101, 115, 116, 34,
      ]));
      assert.deepEqual(msg, ["test", "test"]);
    }
  });
});

/* Output */
describe("Output", () => {
  it("should create an instance", () => {
    const output = new Output();
    assert.instanceOf(output, Output);
  });
});

/* method */
describe("encode", () => {
  it("should get null", () => {
    const output = new Output();
    assert.isNull(output.encode());
  });

  it("should get null", () => {
    const output = new Output();
    assert.isNull(output.encode(""));
  });

  it("should get null", () => {
    const output = new Output();
    assert.isNull(output.encode(a => a));
  });

  it("should encode message to buffer", () => {
    const output = new Output();
    if (IS_BE) {
      assert.deepEqual(
        output.encode("test"),
        Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34]),
      );
    } else {
      assert.deepEqual(
        output.encode("test"),
        Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34]),
      );
    }
  });
});
