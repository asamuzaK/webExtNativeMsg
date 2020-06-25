/**
 * native-message.js
 */
"use strict";
/* api */
const {isString} = require("./common");

/* constants */
const {CHAR, IS_BE} = require("./constant");
const BYTE_LEN = 4;

/* Input */
class Input {
  /**
   * decode message from buffer
   */
  constructor() {
    this._input;
    this._length;
  }

  /**
   * buffer to message
   *
   * @returns {Array} - message array
   */
  _decoder() {
    const arr = [];
    if (Buffer.isBuffer(this._input)) {
      if (!this._length && this._input.length >= BYTE_LEN) {
        this._length = IS_BE && this._input.readUIntBE(0, BYTE_LEN) ||
                       this._input.readUIntLE(0, BYTE_LEN);
        this._input = this._input.slice(BYTE_LEN);
      }
      if (this._length && this._input.length >= this._length) {
        const buf = this._input.slice(0, this._length);
        arr.push(JSON.parse(buf.toString(CHAR)));
        this._input = this._input.length > this._length &&
                      this._input.slice(this._length) || null;
        this._length = null;
        if (this._input) {
          const cur = this._decoder();
          cur.length && arr.push(cur);
        }
      }
    }
    return arr.flat();
  }

  /**
   * decode message
   *
   * @param {string|Buffer} chunk - chunk
   * @returns {?Array} - message array
   */
  decode(chunk) {
    let msg;
    const buf =
      (isString(chunk) || Buffer.isBuffer(chunk)) && Buffer.from(chunk);
    if (buf) {
      if (Buffer.isBuffer(this._input)) {
        this._input = Buffer.concat([this._input, buf]);
      } else {
        this._input = buf;
      }
    }
    if (Buffer.isBuffer(this._input) && this._input.length >= BYTE_LEN) {
      const arr = this._decoder();
      if (Array.isArray(arr) && arr.length) {
        msg = arr;
      }
    }
    return msg || null;
  }
}

/* Output */
class Output {
  /* encode message to buffer */
  constructor() {
    this._output;
  }

  /**
   * message to buffer
   *
   * @returns {?Buffer} - buffered message
   */
  _encoder() {
    let msg = JSON.stringify(this._output);
    if (isString(msg)) {
      const buf = Buffer.from(msg);
      const len = Buffer.alloc(BYTE_LEN);
      IS_BE && len.writeUIntBE(buf.length, 0, BYTE_LEN) ||
      len.writeUIntLE(buf.length, 0, BYTE_LEN);
      msg = Buffer.concat([len, buf]);
    }
    this._output = null;
    return Buffer.isBuffer(msg) && msg || null;
  }

  /**
   * encode message
   *
   * @param {object} msg - message
   * @returns {?Buffer} - buffered message
   */
  encode(msg) {
    let buf;
    if (msg) {
      this._output = msg;
      buf = this._encoder();
    }
    return Buffer.isBuffer(buf) && buf || null;
  }
}

module.exports = {
  Input, Output,
};
