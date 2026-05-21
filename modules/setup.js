/**
 * setup.js
 */

/* api */
import path from 'node:path';
import process from 'node:process';
import { Separator, confirm, select } from '@inquirer/prompts';
import { browserData } from './browser-data.js';
import { ChildProcess } from './child-process.js';
import { getType, isString, quoteArg } from './common.js';
import {
  createDirectory, createFile, getAbsPath, isDir, isFile
} from './file-util.js';

/* constants */
import {
  CHAR, DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME,
  EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN
} from './constant.js';
const DIR_CONFIG = (IS_WIN && DIR_CONFIG_WIN) || (IS_MAC && DIR_CONFIG_MAC) ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const PERM_DIR = 0o755;
const PERM_EXEC = 0o755;
const PERM_FILE = 0o644;

/* wrap inquirer (for test) */
export const inquirer = {
  confirm,
  select
};

/**
 * handle inquirer error
 * @param {object} e - Error
 * @throws {Error} - Error
 */
export const handleInquirerError = e => {
  if (e instanceof Error) {
    if (e.name === 'ExitPromptError') {
      throw new Error('Setup aborted by user.');
    }
    throw e;
  }
  throw new Error('Unknown error.');
};

/**
 * get browser data
 * @param {string} key - key
 * @returns {object} - browser data
 */
export const getBrowserData = key => {
  let browser;
  key = isString(key) && key.toLowerCase().trim();
  if (key) {
    const items = Object.entries(browserData);
    for (const [item, obj] of items) {
      if (item === key) {
        if ((IS_WIN && obj.regWin) || (IS_MAC && obj.hostMac) ||
            (!IS_WIN && !IS_MAC && obj.hostLinux)) {
          browser = browserData[item];
        }
        break;
      }
    }
  }
  return browser || null;
};

/**
 * get config directory
 * @param {object} opt - options
 * @returns {string} - config directory
 */
export const getConfigDir = (opt = {}) => {
  const { configPath, hostName } = opt;
  let dir;
  if (configPath && isString(configPath)) {
    const dirPath = getAbsPath(configPath);
    if (!dirPath.startsWith(DIR_HOME) && !dirPath.startsWith(DIR_CWD)) {
      throw new Error(`${dirPath} is not sub directory of ${DIR_HOME}.`);
    }
    dir = dirPath;
  } else if (hostName && isString(hostName)) {
    dir = path.resolve(DIR_CONFIG, hostName, 'config');
  } else {
    dir = path.resolve(DIR_CWD, 'config');
  }
  return dir;
};

/* Setup */
export class Setup {
  /* private fields */
  #browser;
  #browserConfigDir;
  #callback;
  #chromeExtIds;
  #configDir;
  #hostDesc;
  #hostName;
  #mainFile;
  #overwriteConfig;
  #supportedBrowsers;
  #webExtIds;

  /**
   * setup options
   * @param {object} [opt] - options
   * @param {string} [opt.browser] - specify the browser
   * @param {string} [opt.configPath] - config path
   * @param {string} [opt.hostDescription] - host description
   * @param {string} [opt.hostName] - host name
   * @param {string} [opt.mainScriptFile] - file name of the main script
   * @param {Array.<string>} [opt.chromeExtensionIds] - chrome extension IDs
   * @param {Array.<string>} [opt.webExtensionIds] - web extension IDs
   * @param {Array.<string>} [opt.supportedBrowsers] - supported browsers
   * @param {Function} [opt.callback] - callback after setup
   * @param {boolean} [opt.overwriteConfig] - overwrite config if exists
   */
  constructor(opt = {}) {
    const {
      browser, callback, chromeExtensionIds, configPath, hostDescription,
      hostName, mainScriptFile, overwriteConfig, supportedBrowsers,
      webExtensionIds
    } = opt;
    this.#browser = isString(browser) ? getBrowserData(browser) : null;
    this.#supportedBrowsers =
      (Array.isArray(supportedBrowsers) && supportedBrowsers.length)
        ? supportedBrowsers
        : Object.keys(browserData);
    this.#configDir = getConfigDir({
      configPath,
      hostName
    });
    this.#hostDesc = isString(hostDescription) ? hostDescription : null;
    this.#hostName = isString(hostName) ? hostName : null;
    this.#mainFile = isString(mainScriptFile) ? mainScriptFile : 'index.js';
    this.#chromeExtIds =
      (Array.isArray(chromeExtensionIds) && chromeExtensionIds.length)
        ? chromeExtensionIds
        : null;
    this.#webExtIds =
      (Array.isArray(webExtensionIds) && webExtensionIds.length)
        ? webExtensionIds
        : null;
    this.#callback = typeof callback === 'function' ? callback : null;
    this.#overwriteConfig = !!overwriteConfig;
    this.#browserConfigDir = null;
  }

  /* getters / setters */
  get browser() {
    let browser;
    if (this.#browser) {
      const { alias } = this.#browser;
      browser = alias;
    }
    return browser || null;
  }

  set browser(browser) {
    this.#browser = isString(browser) ? getBrowserData(browser) : null;
  }

  get supportedBrowsers() {
    return this.#supportedBrowsers;
  }

  set supportedBrowsers(arr) {
    if (Array.isArray(arr) && arr.length) {
      this.#supportedBrowsers = arr;
    }
  }

  get configPath() {
    return this.#configDir;
  }

  set configPath(dir) {
    this.#configDir = getConfigDir({
      configPath: dir,
      hostName: this.#hostName
    });
  }

  get hostDescription() {
    return this.#hostDesc;
  }

  set hostDescription(desc) {
    this.#hostDesc = isString(desc) ? desc : null;
  }

  get hostName() {
    return this.#hostName;
  }

  set hostName(name) {
    this.#hostName = isString(name) ? name : null;
  }

  get mainScriptFile() {
    return this.#mainFile;
  }

  set mainScriptFile(name) {
    this.#mainFile = isString(name) ? name : 'index.js';
  }

  get chromeExtensionIds() {
    return this.#chromeExtIds;
  }

  set chromeExtensionIds(arr) {
    this.#chromeExtIds = (Array.isArray(arr) && arr.length) ? arr : null;
  }

  get webExtensionIds() {
    return this.#webExtIds;
  }

  set webExtensionIds(arr) {
    this.#webExtIds = (Array.isArray(arr) && arr.length) ? arr : null;
  }

  get callback() {
    return this.#callback;
  }

  set callback(func) {
    this.#callback = typeof func === 'function' ? func : null;
  }

  get overwriteConfig() {
    return this.#overwriteConfig;
  }

  set overwriteConfig(overwrite) {
    this.#overwriteConfig = !!overwrite;
  }

  /**
   * get browser specific config directory
   * @private
   * @returns {?string} - config directory
   */
  _getBrowserConfigDir() {
    let dir;
    if (this.#browser) {
      const {
        alias, aliasLinux, aliasMac, aliasWin, hostLinux, hostMac, regWin
      } = this.#browser;
      const label = (IS_WIN && regWin && (aliasWin ?? alias)) ||
                    (IS_MAC && hostMac && (aliasMac ?? alias)) ||
                    (!IS_WIN && !IS_MAC && hostLinux && (aliasLinux ?? alias));
      if (this.#configDir && isString(label)) {
        dir = path.join(this.#configDir, label);
      }
    }
    return dir || null;
  }

  /**
   * create registry
   * @private
   * @param {string} manifestPath - manifest path
   * @returns {Promise.<void>} - Promise
   */
  async _createReg(manifestPath) {
    if (!isFile(manifestPath)) {
      throw new Error(`No such file: ${manifestPath}.`);
    }
    if (!this.#browser) {
      throw new TypeError(`Expected Object but got ${getType(this.#browser)}.`);
    }
    if (!isString(this.#hostName)) {
      throw new TypeError(`Expected String but got ${getType(this.#hostName)}.`);
    }
    if (IS_WIN) {
      const { regWin } = this.#browser;
      const regKey = path.join(...regWin, this.#hostName);
      const winDir = process.env.windir || process.env.WINDIR || 'C:\\Windows';
      const reg = path.join(winDir, 'System32', 'reg.exe');
      const args = ['add', regKey, '/ve', '/d', manifestPath, '/f'];
      const opt = {
        cwd: null,
        encoding: CHAR,
        env: process.env
      };
      const proc = await new ChildProcess(reg, args, opt).spawn();
      return new Promise((resolve, reject) => {
        proc.on('error', reject);
        proc.stderr.on('data', data => {
          if (data) {
            console.error(`stderr: ${data.toString()}`);
          }
          reject(new Error('Failed to create registry key.'));
        });
        proc.on('close', code => {
          if (code === 0) {
            console.info(`Created: ${regKey}`);
            resolve();
          } else {
            reject(new Error(`${reg} exited with ${code}.`));
          }
        });
      });
    }
  }

  /**
   * create manifest
   * @private
   * @param {string} shellPath - shell script path
   * @param {string} configDir - config directory path
   * @returns {Promise.<string>} - manifest path
   */
  async _createManifest(shellPath, configDir) {
    if (!isFile(shellPath)) {
      throw new Error(`No such file: ${shellPath}.`);
    }
    if (IS_WIN && !isDir(configDir)) {
      throw new Error(`No such directory: ${configDir}.`);
    }
    if (!this.#browser) {
      throw new TypeError(`Expected Object but got ${getType(this.#browser)}.`);
    }
    if (!isString(this.#hostDesc)) {
      throw new TypeError(`Expected String but got ${getType(this.#hostDesc)}.`);
    }
    if (!isString(this.#hostName)) {
      throw new TypeError(`Expected String but got ${getType(this.#hostName)}.`);
    }
    const { hostLinux, hostMac, type } = this.#browser;
    const allowedField = {
      [EXT_CHROME]: {
        key: 'allowed_origins',
        value: this.#chromeExtIds
      },
      [EXT_WEB]: {
        key: 'allowed_extensions',
        value: this.#webExtIds
      }
    };
    const { key, value } = allowedField[type];
    if (!Array.isArray(value)) {
      throw new TypeError(`Expected Array but got ${getType(value)}.`);
    }
    const manifest = {
      [key]: [...value],
      description: this.#hostDesc,
      name: this.#hostName,
      path: shellPath,
      type: 'stdio'
    };
    const content = `${JSON.stringify(manifest, null, INDENT)}\n`;
    const fileName = `${this.#hostName}.json`;
    const dir = (IS_WIN && configDir) || (IS_MAC && path.join(...hostMac)) ||
                path.join(...hostLinux);
    const manifestDir = await createDirectory(dir);
    const manifestPath = path.resolve(manifestDir, fileName);
    await createFile(manifestPath, content, {
      encoding: CHAR, flag: 'w', mode: PERM_FILE
    });
    console.info(`Created: ${manifestPath}`);
    return manifestPath;
  }

  /**
   * create shell script
   * @private
   * @param {string} configDir - config directory path
   * @returns {Promise.<string>} - shell script path
   */
  async _createShellScript(configDir) {
    if (!isDir(configDir)) {
      throw new Error(`No such directory: ${configDir}.`);
    }
    if (!isString(this.#hostName)) {
      throw new TypeError(`Expected String but got ${getType(this.#hostName)}.`);
    }
    const appPath = process.execPath;
    const filePath = path.resolve(DIR_CWD, this.#mainFile);
    const cmd =
      (isFile(filePath) && `${quoteArg(appPath)} ${quoteArg(filePath)}`) ||
      quoteArg(appPath);
    const shell = process.env.SHELL || '/bin/sh';
    const content =
      (IS_WIN && `@echo off\n${cmd}\n`) || `#!${shell}\n${cmd}\n`;
    const shellExt = (IS_WIN && 'cmd') || 'sh';
    const shellPath = path.join(configDir, `${this.#hostName}.${shellExt}`);
    await createFile(shellPath, content, {
      encoding: CHAR, flag: 'w', mode: PERM_EXEC
    });
    console.info(`Created: ${shellPath}`);
    return shellPath;
  }

  /**
   * create config directory
   * @private
   * @returns {Promise.<string>} - config directory path
   */
  async _createConfigDir() {
    this.#browserConfigDir ??= this._getBrowserConfigDir();
    if (!isString(this.#browserConfigDir)) {
      throw new TypeError(`Expected String but got ${getType(this.#browserConfigDir)}.`);
    }
    const configDir = await createDirectory(this.#browserConfigDir, PERM_DIR);
    console.info(`Created: ${configDir}`);
    return configDir;
  }

  /**
   * create files
   * @private
   * @returns {Promise.<object>} - result object containing paths
   */
  async _createFiles() {
    const configDir = await this._createConfigDir();
    const shellPath = await this._createShellScript(configDir);
    const manifestPath = await this._createManifest(shellPath, configDir);
    if (!isDir(configDir) || !isFile(shellPath) || !isFile(manifestPath)) {
      throw new Error('Failed to create files.');
    }
    if (IS_WIN) {
      await this._createReg(manifestPath);
    }
    const result = {
      configDirPath: configDir,
      shellScriptPath: shellPath,
      manifestPath
    };
    if (typeof this.#callback === 'function') {
      this.#callback(result);
    }
    return result;
  }

  /**
   * handle browser config directory input
   * @private
   * @returns {Promise.<object>} - result object containing paths
   */
  async _handleBrowserConfigDir() {
    this.#browserConfigDir ??= this._getBrowserConfigDir();
    if (isDir(this.#browserConfigDir) && !this.#overwriteConfig) {
      const dir = this.#browserConfigDir;
      const ans = await inquirer.confirm({
        message: `${dir} already exists. Overwrite?`,
        default: false
      }).catch(handleInquirerError);
      if (ans) {
        return this._createFiles();
      } else {
        throw new Error(`${dir} already exists.`);
      }
    }
    return this._createFiles();
  }

  /**
   * handle browser input
   * @private
   * @param {Array.<string>} arr - browser array
   * @returns {Promise.<object>} - result object containing paths
   */
  async _handleBrowserInput(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError(`Expected Array but got ${getType(arr)}.`);
    }
    const choices = [];
    for (const item of arr) {
      const choice = {
        name: item,
        value: item
      };
      choices.push(choice);
    }
    choices.push(new Separator(), {
      name: 'CANCEL',
      value: null
    });
    const opt = {
      choices,
      message: 'Select a browser.'
    };
    if (arr.length > 5) {
      opt.pageSize = arr.length + 2;
    }
    const ans = await inquirer.select(opt).catch(handleInquirerError);
    if (ans) {
      this.#browser = getBrowserData(ans);
    }
    if (this.#browser) {
      this.#browserConfigDir = this._getBrowserConfigDir();
      return this._handleBrowserConfigDir();
    } else {
      throw new Error('Browser is not specified.');
    }
  }

  /**
   * run setup
   * @returns {Promise.<object>} - result object containing paths
   */
  async run() {
    this.#browserConfigDir = this._getBrowserConfigDir();
    if (this.#browserConfigDir) {
      return this._handleBrowserConfigDir();
    } else {
      const arr = [];
      const items = Object.entries(browserData);
      for (const [item, obj] of items) {
        if (this.#supportedBrowsers.includes(item) &&
            ((IS_WIN && obj.regWin) || (IS_MAC && obj.hostMac) ||
             (!IS_WIN && !IS_MAC && obj.hostLinux)) &&
            ((obj.type === EXT_CHROME && this.#chromeExtIds) ||
             (obj.type === EXT_WEB && this.#webExtIds))) {
          arr.push(item);
        }
      }
      return this._handleBrowserInput(arr);
    }
  }
}
