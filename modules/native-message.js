/**
 * native-message.js
 */

/* api */
import { isString } from './common.js';

/* constants */
import { CHAR, IS_BE } from './constant.js';
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
        this.#length = IS_BE
          ? this.#input.readUIntBE(0, BYTE_LEN)
          : this.#input.readUIntLE(0, BYTE_LEN);
        this.#input = this.#input.slice(BYTE_LEN);
      }
      if (this.#length && this.#input.length >= this.#length) {
        const buf = this.#input.slice(0, this.#length);
        arr.push(JSON.parse(buf.toString(CHAR)));
        this.#input = this.#input.length > this.#length
          ? this.#input.slice(this.#length)
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
      (IS_BE && len.writeUIntBE(buf.length, 0, BYTE_LEN)) ||
      len.writeUIntLE(buf.length, 0, BYTE_LEN);
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
