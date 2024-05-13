/**
 * child-process.js
 */

/* api */
import childProcess from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'shell-quote';
import { getType, isString } from './common.js';
import { isExecutable, isFile } from './file-util.js';

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
      this.#args = args;
    } else if (args && isString(args)) {
      this.#args = parse(args);
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
  };

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
    return childProcess.spawn(this.#cmd, this.#args, this.#opt);
  }
}
