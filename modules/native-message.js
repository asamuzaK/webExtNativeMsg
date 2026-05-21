/**
 * native-message.js
 */

/* api */
import os from 'node:os';
import { isString } from './common.js';

/* constants */
import { CHAR } from './constant.js';
const BYTE_LEN = 4;

/* Input */
export class Input {
  /* private fields */
  #input;
  #length;

  /**
   * decode message from buffer
   */
  constructor() {
    this.#input = null;
    this.#length = null;
  }

  /**
   * buffer to message
   * @private
   * @returns {Array.<string>} - message array
   */
  #decoder() {
    let arr = [];
    if (Buffer.isBuffer(this.#input)) {
      if (!this.#length && this.#input.length >= BYTE_LEN) {
        this.#length = os.endianness() === 'BE'
          ? this.#input.readUInt32BE(0)
          : this.#input.readUInt32LE(0);
        this.#input = this.#input.subarray(BYTE_LEN);
      }
      if (this.#length && this.#input.length >= this.#length) {
        const buf = this.#input.subarray(0, this.#length);
        arr.push(JSON.parse(buf.toString(CHAR)));
        this.#input = this.#input.length > this.#length
          ? this.#input.subarray(this.#length)
          : null;
        this.#length = null;
        if (this.#input) {
          const cur = this.#decoder();
          if (cur.length) {
            arr = arr.concat(cur);
          }
        }
      }
    }
    return arr;
  }

  /**
   * decode message
   * @param {string|Buffer} chunk - chunk
   * @returns {?Array.<string>} - message array
   */
  decode(chunk) {
    let msg;
    const buf =
      (isString(chunk) || Buffer.isBuffer(chunk)) && Buffer.from(chunk);
    if (buf) {
      if (Buffer.isBuffer(this.#input)) {
        this.#input = Buffer.concat([this.#input, buf]);
      } else {
        this.#input = buf;
      }
    }
    if (Buffer.isBuffer(this.#input) && this.#input.length >= BYTE_LEN) {
      const arr = this.#decoder();
      if (Array.isArray(arr) && arr.length) {
        msg = arr;
      }
    }
    return msg || null;
  }
}

/* Output */
export class Output {
  /* private fields */
  #output;

  /* encode message to buffer */
  constructor() {
    this.#output = null;
  }

  /**
   * message to buffer
   * @private
   * @returns {?Buffer} - buffered message
   */
  #encoder() {
    let msg = JSON.stringify(this.#output);
    if (isString(msg)) {
      const buf = Buffer.from(msg);
      const len = Buffer.alloc(BYTE_LEN);
      if (os.endianness() === 'BE') {
        len.writeUInt32BE(buf.length, 0);
      } else {
        len.writeUInt32LE(buf.length, 0);
      }
      msg = Buffer.concat([len, buf]);
    }
    this.#output = null;
    return Buffer.isBuffer(msg) ? msg : null;
  }

  /**
   * encode message
   * @param {object} msg - message
   * @returns {?Buffer} - buffered message
   */
  encode(msg) {
    let buf;
    if (msg) {
      this.#output = msg;
      buf = this.#encoder();
    }
    return Buffer.isBuffer(buf) ? buf : null;
  }
}
