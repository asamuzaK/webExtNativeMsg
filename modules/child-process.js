/**
 * child-process.js
 */

/* api */
import { escapeChar, getType, isString, quoteArg } from './common.js';
import { isExecutable } from './file-util.js';
import childProcess from 'child_process';
import process from 'process';

/**
 * concat array
 *
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
 *
 * @param {string} arg - argument
 * @returns {string} - argument
 */
export const correctArg = arg => {
  if (!isString(arg)) {
    throw new TypeError(`Expected String but got ${getType(arg)}.`);
  }
  if (/^\s*(?:".*"|'.*')\s*$/.test(arg)) {
    arg = arg.trim();
    if (/^".*\\["\\].*"$/.test(arg)) {
      arg = arg.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    arg = arg.replace(/^['"]/, '').replace(/["']$/, '');
  } else {
    if (/^(?:.){0,4096}\\(?:.){0,4096}$/.test(arg)) {
      arg = arg.replace(/\\(?!\\)/g, '');
    }
    if (/"([^"]{1,4096}){0,4096}"|'([^']{1,4096}){0,4096}'/.test(arg)) {
      arg = arg.replace(/"([^"]{1,4096}){0,4096}"|'([^']{1,4096}){0,4096}'/g, (m, c1, c2) => c1 || c2);
    }
  }
  return arg;
};

/**
 * extract argument
 *
 * @param {string} arg - argument
 * @returns {Array} - arguments array
 */
export const extractArg = arg => {
  if (!isString(arg)) {
    throw new TypeError(`Expected String but got ${getType(arg)}.`);
  }
  let arr;
  arg = escapeChar(arg, /(\\)/g);
  if (arg) {
    const reCmd = /(?:^|\s)(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')(?=\s|$)|(?:\\ |[^\s]){1,4096}(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')(?:(?:\\ |[^\s]){1,4096}(?:"(?:[^"\\]|\\[^"]|\\"){0,4096}"|'(?:[^'\\]|\\[^']|\\'){0,4096}')){0,4096}(?:\\ |[^\s]){0,4096}|(?:[^"'\s\\]|\\[^\s]|\\ ){1,4096}/g;
    arr = arg.match(reCmd);
  }
  return Array.isArray(arr) ? arr.map(correctArg) : [];
};

/**
 * stringify argument string
 *
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
  /**
   * argument input
   *
   * @param {string|Array} input - input
   */
  constructor(input) {
    this._input = input;
  }

  /**
   * arguments to array
   *
   * @returns {Array} - arguments array
   */
  toArray() {
    let arr;
    if (Array.isArray(this._input)) {
      arr = this._input;
    } else if (isString(this._input)) {
      const args = [this._input].map(extractArg);
      arr = args.reduce(concatArray);
    }
    return arr || [];
  }

  /**
   * arguments array to string
   *
   * @returns {string} - arguments string
   */
  toString() {
    const args = this.toArray().map(stringifyArg).join(' ');
    return args.trim();
  }
}

/* Child process */
export class ChildProcess {
  /**
   * command, arguments and option
   *
   * @param {string} cmd - command
   * @param {string|Array} [args] - command arguments
   * @param {object} [opt] - options
   */
  constructor(cmd, args, opt) {
    this._cmd = isString(cmd) ? cmd : null;
    this._args = new CmdArgs(args).toArray();
    this._opt =
      getType(opt) === 'Object' ? opt : { cwd: null, env: process.env };
  }

  /**
   * spawn child process
   *
   * @param {string} [file] - file
   * @returns {object} - child process
   */
  async spawn(file) {
    if (!isExecutable(this._cmd)) {
      throw new Error(`${this._cmd} is not executable.`);
    }
    if (isString(file)) {
      const [filePath] = new CmdArgs(quoteArg(file)).toArray();
      this._args.push(filePath);
    }
    return childProcess.spawn(this._cmd, this._args, this._opt);
  }
}
