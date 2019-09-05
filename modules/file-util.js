/**
 * file-util.js
 */
"use strict";
/* api */
const {URL, fileURLToPath} = require("url");
const {compareSemVer} = require("semver-parser");
const {getType, isString} = require("./common");
const fs = require("fs");
const path = require("path");
const process = require("process");
const {promises: fsPromise} = fs;

/* constants */
const {IS_WIN} = require("./constant");
const MASK_BIT = 0o111;
const PERM_DIR = 0o777;
const PERM_FILE = 0o666;
const SUBST = "index";

/**
 * convert URI to native file path
 * @param {string} uri - URI
 * @returns {?string} - file path
 */
const convertUriToFilePath = uri => {
  if (!isString(uri)) {
    throw new TypeError(`Expected String but got ${getType(uri)}.`);
  }
  const {protocol, pathname} = new URL(uri);
  let file;
  if (protocol === "file:" && pathname) {
    // NOTE: remove version detection when node 10 reaches EOL
    const {version: nodeVersion} = process;
    const result = compareSemVer(nodeVersion, "10.16.0");
    if (result >= 0) {
      file = fileURLToPath(uri);
    } else {
      file = IS_WIN && path.normalize(decodeURIComponent(pathname).slice(1)) ||
             decodeURIComponent(pathname);
    }
  }
  return file || null;
};

/**
 * get absolute path
 * @param {string} file - file path
 * @returns {?string} - absolute file path
 */
const getAbsPath = file => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  const abs = path.resolve(file);
  return abs;
};

/**
 * get stat
 * @param {string} file - file path
 * @returns {Object} - file stat
 */
const getStat = file =>
  isString(file) && fs.existsSync(file) && fs.statSync(file) || null;

/**
 * the directory is a directory
 * @param {string} dir - directory path
 * @returns {boolean} - result
 */
const isDir = dir => {
  const stat = getStat(dir);
  return stat && stat.isDirectory() || false;
};

/**
 * the directory is a subdirectory of a certain directory
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {boolean} - result
 */
const isSubDir = (dir, baseDir) =>
  isDir(dir) && isDir(baseDir) && dir.startsWith(baseDir);

/**
 * the file is a file
 * @param {string} file - file path
 * @returns {boolean} - result
 */
const isFile = file => {
  const stat = getStat(file);
  return stat && stat.isFile() || false;
};

/**
 * the file is executable
 * NOTE: On Windows, fs.statSync(file).mode returns 33206 for executable
 * files like `.exe`, which is 100666 in octal.
 * @param {string} file - file path
 * @param {number} [mask] - mask bit
 * @returns {boolean} - result
 */
const isExecutable = (file, mask = MASK_BIT) => {
  const stat = getStat(file);
  return stat && (
    !!(stat.mode & mask) || IS_WIN && /\.(?:bat|cmd|exe|ps1|wsh)$/i.test(file)
  ) || false;
};

/**
 * get file timestamp
 * @param {string} file - file path
 * @returns {number} - timestamp
 */
const getFileTimestamp = file => {
  const stat = getStat(file);
  return stat && stat.mtime.getTime() || 0;
};

/**
 * get file name from native file path
 * @param {string} file - file path
 * @param {string} [subst] - substitute file name
 * @returns {string} - file name
 */
const getFileNameFromFilePath = (file, subst = SUBST) => {
  let name;
  if (isString(file) && isFile(file)) {
    name = /^([^.]+)(?:\..+)?$/.exec(path.basename(file));
  }
  return name && name[1] || subst;
};

/**
 * remove the directory and it's files
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {void}
 */
const removeDir = (dir, baseDir) => {
  if (isDir(dir)) {
    if (!isSubDir(dir, baseDir)) {
      throw new Error(`${dir} is not a subdirectory of ${baseDir}.`);
    }
    // NOTE: remove version detection when node 10 reaches EOL
    const {version: nodeVersion} = process;
    const result = compareSemVer(nodeVersion, "12.10.0");
    if (result >= 0) {
      fs.rmdirSync(dir, {recursive: true});
    } else {
      const files = fs.readdirSync(dir);
      files.length && files.forEach(file => {
        const cur = path.join(dir, file);
        if (fs.lstatSync(cur).isDirectory()) {
          removeDir(cur, baseDir);
        } else {
          fs.unlinkSync(cur);
        }
      });
      fs.rmdirSync(dir);
    }
  }
};

/**
 * remove the directory and it's files
 * @param {string} dir - directory path
 * @param {string} baseDir - base directory path
 * @returns {void}
 */
const removeDirectory = async (dir, baseDir) => {
  await removeDir(dir, baseDir);
};

/**
 * create a directory
 * @param {string} dir - directory path to create
 * @param {number} [mode] - permission
 * @returns {string} - directory path
 */
const createDirectory = async (dir, mode = PERM_DIR) => {
  if (!isString(dir)) {
    throw new TypeError(`Expected String but got ${getType(dir)}.`);
  }
  if (!Number.isInteger(mode)) {
    throw new TypeError(`Expected Number but got ${getType(mode)}.`);
  }
  const dirPath = path.resolve(path.normalize(dir));
  const opt = {
    mode,
    recursive: true,
  };
  !isDir(dirPath) && await fsPromise.mkdir(dirPath, opt);
  return dirPath;
};

/**
 * create a file
 * @param {string} file - file path to create
 * @param {string|Buffer|Uint8Array} value - value to write
 * @param {Object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @param {number|string} [opt.mode] - file permission
 * @returns {string} - file path
 */
const createFile = async (file, value, opt = {
  encoding: null, flag: "w", mode: PERM_FILE,
}) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(value) && !Buffer.isBuffer(value) &&
      !(value instanceof Uint8Array)) {
    throw new TypeError(
      `Expected String, Buffer, Uint8Array but got ${getType(value)}.`
    );
  }
  const filePath = path.resolve(path.normalize(file));
  await fsPromise.writeFile(filePath, value, opt);
  return filePath;
};

/**
 * read a file
 * @param {string} file - file path
 * @param {Object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @returns {string|Buffer} - file content
 */
const readFile = async (file, opt = {encoding: null, flag: "r"}) => {
  if (!isFile(file)) {
    throw new Error(`${file} is not a file.`);
  }
  const value = await fsPromise.readFile(file, opt);
  return value;
};

module.exports = {
  convertUriToFilePath, createDirectory, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir,
  isExecutable, isFile, isSubDir, removeDir, removeDirectory, readFile,
};
