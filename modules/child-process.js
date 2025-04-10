/**
 * child-process.js
 */

/* api */
import childProcess from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { parse as parseCmd } from 'shell-quote';
import { escapeChar, getType, isString } from './common.js';
import { isExecutable, isFile } from './file-util.js';

/**
 * concat array
 * @param {Array} arrA - array
 * @param {Array} arrB - array
 * @returns {Array} - array
 */
export const concatArray = (arrA, arrB) => {
  if (!Array.isArray(arrA)) {
    throw new TypeError(`Expected Array but got ${getType(arrA)}.`);
  }
  if (!Array.isArray(arrB)) {
    throw new TypeError(`Expected Array but got ${getType(arrB)}.`);
  }
  return arrA.concat(arrB);
};

/**
 * correct argument string
 * @param {string} arg - argument
 * @returns {string} - argument
 */
export const correctArg = arg => {
  if (!isString(arg)) {
    throw new TypeError(`Expected String but got ${getType(arg)}.`);
  }
  if (/^\s*(?:".*"|'.*')\s*$/.test(arg)) {
    arg = arg.trim().replace(/^['"]/, '').replace(/["']$/, '');
    if (/\\["\\]/.test(arg)) {
      arg = arg.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
  } else {
    if (/^.{0,4096}\\.{0,4096}$/.test(arg)) {
      arg = arg.replace(/\\(?!\\)/g, '');
    }
    if (/"[^"]{0,16777216}"|'[^']{0,16777216}'/.test(arg)) {
      arg = arg.replace(/"([^"]{1,4096}){0,4096}"|'([^']{1,4096}){0,4096}'/g, (m, c1, c2) => c1 || c2);
    }
  }
  return arg;
};

/**
 * extract argument
 * @param {string} arg - argument
 * @returns {Array.<string|undefined>} - arguments array
 */
export const extractArg = arg => {
  if (!isString(arg)) {
    throw new TypeError(`Expected String but got ${getType(arg)}.`);
  }
  let arr;
  arg = escapeChar(arg, /(\\)/g);
  if (arg) {
    const reCmd = /(?:^|\s)(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')(?=\s|$)|(?:\\ |\S){1,4096}(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')(?:(?:\\ |\S){1,4096}(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')){0,4096}(?:\\ |\S){0,4096}|(?:[^"'\s\\]|\\\S|\\ ){1,4096}/g;
    arr = arg.match(reCmd);
  }
  return Array.isArray(arr) ? arr.map(correctArg) : [];
};

/**
 * stringify argument string
 * @param {string} arg - argument
 * @returns {string} - argument
 */
export const stringifyArg = arg => {
  let str;
  if (isString(arg)) {
    if (/["'\\\s]/.test(arg)) {
      str = `"${escapeChar(arg, /(["\\])/g)}"`.trim();
    } else {
      str = arg.trim();
    }
  } else {
    str = '';
  }
  return str;
};

/* CmdArgs */
export class CmdArgs {
  /* private fields */
  #input;

  /**
   * argument input
   * @param {string|Array} input - input
   */
  constructor(input) {
    this.#input = input;
  }

  /**
   * arguments to array
   * @returns {Array} - arguments array
   */
  toArray() {
    let arr;
    if (Array.isArray(this.#input)) {
      arr = this.#input;
    } else if (isString(this.#input)) {
      const args = [this.#input].map(extractArg);
      arr = args.reduce(concatArray);
    }
    return arr || [];
  }

  /**
   * arguments array to string
   * @returns {string} - arguments string
   */
  toString() {
    const args = this.toArray().map(stringifyArg).join(' ');
    return args.trim();
  }
}

/* Child process */
export class ChildProcess {
  /* private fields */
  #cmd;
  #args;
  #opt;

  /**
   * command, arguments and option
   * @param {string} cmd - command
   * @param {string|Array} [args] - command arguments
   * @param {object} [opt] - options
   */
  constructor(cmd, args, opt) {
    this.#cmd = isString(cmd) ? cmd : null;
    if (Array.isArray(args)) {
      args = new CmdArgs(args).toString();
      this.#args = parseCmd(args);
    } else if (args && isString(args)) {
      this.#args = parseCmd(args);
    } else {
      this.#args = [];
    }
    if (getType(opt) === 'Object') {
      this.#opt = opt;
    } else if (os.platform() === 'win32' && isString(cmd) &&
               /.(?:bat|cmd)/.test(path.extname(cmd))) {
      this.#opt = {
        cwd: null,
        env: process.env,
        shell: true
      };
    } else {
      this.#opt = {
        cwd: null,
        env: process.env
      };
    }
  }

  /**
   * get spawn arguments (for test)
   * @private
   * @returns {Array} - arguments in array
   */
  _getSpawnArgs() {
    return [this.#cmd, this.#args, this.#opt];
  }

  /**
   * spawn child process
   * @param {string} [file] - file
   * @returns {Promise.<object>} - child process
   */
  async spawn(file) {
    if (!isExecutable(this.#cmd)) {
      throw new Error(`${this.#cmd} is not executable.`);
    }
    if (isFile(file)) {
      this.#args.push(file);
    }
    const args = new CmdArgs(this.#args).toString();
    return childProcess.spawn(this.#cmd, parseCmd(args), this.#opt);
  }
}
