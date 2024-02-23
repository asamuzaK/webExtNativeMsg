/**
 * file-util.js
 */

/* api */
import fs, { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getType, isString } from './common.js';

/* constants */
import { IS_WIN } from './constant.js';
const MASK_BIT = 0o111;
const PERM_DIR = 0o777;
const PERM_FILE = 0o666;
const SUBST = 'index';

/**
 * convert URI to native file path
 * @param {string} uri - URI
 * @returns {?string} - file path
 */
export const convertUriToFilePath = uri => {
  if (!isString(uri)) {
    throw new TypeError(`Expected String but got ${getType(uri)}.`);
  }
  const { protocol } = new URL(uri);
  let file;
  if (protocol === 'file:') {
    file = fileURLToPath(uri);
  }
  return file || null;
};

/**
 * get absolute path
 * @param {string} file - file path
 * @returns {?string} - absolute file path
 */
export const getAbsPath = file => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  const abs = path.resolve(file);
  return abs;
};

/**
 * get stat
 * @param {string} file - file path
 * @returns {object} - file stat
 */
export const getStat = file =>
  isString(file) && fs.existsSync(file) ? fs.statSync(file) : null;

/**
 * the directory is a directory
 * @param {string} dir - directory path
 * @returns {boolean} - result
 */
export const isDir = dir => {
  const stat = getStat(dir);
  return stat ? stat.isDirectory() : false;
};

/**
 * the directory is a subdirectory of a certain directory
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {boolean} - result
 */
export const isSubDir = (dir, baseDir) =>
  isDir(dir) && isDir(baseDir) && dir.startsWith(baseDir);

/**
 * the file is a file
 * @param {string} file - file path
 * @returns {boolean} - result
 */
export const isFile = file => {
  const stat = getStat(file);
  return stat ? stat.isFile() : false;
};

/**
 * the file is executable
 * NOTE: On Windows, fs.statSync(file).mode returns 33206 for executable
 * files like `.exe`, which is 100666 in octal.
 * @param {string} file - file path
 * @param {number} [mask] - mask bit
 * @returns {boolean} - result
 */
export const isExecutable = (file, mask = MASK_BIT) => {
  let res;
  const stat = getStat(file);
  if (stat) {
    res = !!(stat.mode & mask) ||
          (IS_WIN && /\.(?:bat|cmd|exe|ps1|wsh)$/i.test(file));
  }
  return !!res;
};

/**
 * get file timestamp
 * @param {string} file - file path
 * @returns {number} - timestamp
 */
export const getFileTimestamp = file => {
  const stat = getStat(file);
  return stat ? stat.mtime.getTime() : 0;
};

/**
 * get file name from native file path
 * @param {string} file - file path
 * @param {string} [subst] - substitute file name
 * @returns {string} - file name
 */
export const getFileNameFromFilePath = (file, subst = SUBST) => {
  let name;
  if (isString(file) && isFile(file) &&
      /^[^.]+(?:\..+)?$/.test(path.basename(file))) {
    [, name] = /^([^.]+)(?:\..+)?$/.exec(path.basename(file));
  }
  return name || subst;
};

/**
 * remove the directory and it's files synchronously
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {void}
 */
export const removeDir = (dir, baseDir) => {
  if (isDir(dir)) {
    if (!isSubDir(dir, baseDir)) {
      throw new Error(`${dir} is not a subdirectory of ${baseDir}.`);
    }
    fs.rmSync(dir, {
      force: true,
      recursive: true
    });
  }
};

/**
 * remove the directory and it's files
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {Promise.<void>} - void
 */
export const removeDirectory = async (dir, baseDir) => {
  if (isDir(dir)) {
    if (!isSubDir(dir, baseDir)) {
      throw new Error(`${dir} is not a subdirectory of ${baseDir}.`);
    }
    await fsPromise.rm(dir, {
      force: true,
      recursive: true
    });
  }
};

/**
 * create a directory
 * @param {string} dir - directory path to create
 * @param {number} [mode] - permission
 * @returns {Promise.<string>} - directory path
 */
export const createDirectory = async (dir, mode = PERM_DIR) => {
  if (!isString(dir)) {
    throw new TypeError(`Expected String but got ${getType(dir)}.`);
  }
  if (!Number.isInteger(mode)) {
    throw new TypeError(`Expected Number but got ${getType(mode)}.`);
  }
  const dirPath = path.resolve(path.normalize(dir));
  const opt = {
    mode,
    recursive: true
  };
  !isDir(dirPath) && await fsPromise.mkdir(dirPath, opt);
  return dirPath;
};

/**
 * create a file
 * @param {string} file - file path to create
 * @param {string|Buffer|Uint8Array} value - value to write
 * @param {object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @param {number|string} [opt.mode] - file permission
 * @returns {Promise.<string>} - file path
 */
export const createFile = async (file, value, opt = {
  encoding: null, flag: 'w', mode: PERM_FILE
}) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(value) && !Buffer.isBuffer(value) &&
      !(value instanceof Uint8Array)) {
    throw new TypeError(`Expected String, Buffer, Uint8Array but got ${getType(value)}.`);
  }
  const filePath = path.resolve(path.normalize(file));
  await fsPromise.writeFile(filePath, value, opt);
  return filePath;
};

/**
 * read a file
 * @param {string} file - file path
 * @param {object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @returns {Promise.<string|Buffer>} - file content
 */
export const readFile = async (file, opt = { encoding: null, flag: 'r' }) => {
  if (!isFile(file)) {
    throw new Error(`${file} is not a file.`);
  }
  const value = await fsPromise.readFile(file, opt);
  return value;
};
