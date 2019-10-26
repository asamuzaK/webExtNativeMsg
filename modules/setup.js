/**
 * setup.js
 */
"use strict";
/* api */
const {ChildProcess} = require("./child-process");
const {browserData} = require("./browser-data");
const {getType, isString, quoteArg, throwErr} = require("./common");
const {
  createDirectory, createFile, getAbsPath, isDir, isFile,
} = require("./file-util");
const path = require("path");
const process = require("process");
const readline = require("readline-sync");

/* constants */
const {
  CHAR, DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME,
  EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN,
} = require("./constant");
const DIR_CONFIG = IS_WIN && DIR_CONFIG_WIN || IS_MAC && DIR_CONFIG_MAC ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const PERM_DIR = 0o755;
const PERM_EXEC = 0o755;
const PERM_FILE = 0o644;

/* created path values */
const values = new Map();

/**
 * abort setup
 * @param {string} msg - message
 * @returns {void}
 */
const abortSetup = msg => {
  values.clear();
  console.info(`Setup aborted: ${msg}`);
  process.exit();
};

/**
 * handle setup callback
 * @returns {?Function} - callback
 */
const handleSetupCallback = () => {
  let func;
  const callback = values.get("callback");
  if (typeof callback === "function") {
    const configDirPath = values.get("configDir");
    const shellScriptPath = values.get("shellPath");
    const manifestPath = values.get("manifestPath");
    func = callback({
      configDirPath, manifestPath, shellScriptPath,
    });
  }
  values.clear();
  return func || null;
};

/**
 * handle create registry close
 * @param {number} code - exit code
 * @returns {?Function} - handleSetupCallback()
 */
const handleRegClose = code => {
  let func;
  if (IS_WIN) {
    if (code === 0) {
      const regKey = values.get("regKey");
      console.info(`Created: ${regKey}`);
      func = handleSetupCallback();
    } else {
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      func = abortSetup(`${reg} exited with ${code}.`);
    }
  }
  return func || null;
};

/**
 * handle registry stderr
 * @param {*} data - data
 * @returns {Function} - abortSetup()
 */
const handleRegStderr = data => {
  let func;
  if (IS_WIN) {
    data && console.error(`stderr: ${data.toString()}`);
    func = abortSetup("Failed to create registry key.");
  }
  return func || null;
};

/**
 * get browser data
 * @param {string} key - key
 * @returns {Object} - browser data
 */
const getBrowserData = key => {
  let browser;
  key = isString(key) && key.toLowerCase().trim();
  if (key) {
    const items = Object.entries(browserData);
    for (const [item, obj] of items) {
      if (item === key) {
        if (IS_WIN && obj.regWin || IS_MAC && obj.hostMac ||
            !IS_WIN && !IS_MAC && obj.hostLinux) {
          browser = browserData[item];
        }
        break;
      }
    }
  }
  return browser || null;
};

/* Setup */
class Setup {
  /**
   * setup options
   * @param {Object} [opt] - options
   * @param {string} [opt.browser] - specify the browser
   * @param {string} [opt.configPath] - config path
   * @param {string} [opt.hostDescription] - host description
   * @param {string} [opt.hostName] - host name
   * @param {string} [opt.mainScriptFile] - file name of the main script
   * @param {Array} [opt.chromeExtensionIds] - array of chrome extension IDs
   * @param {Array} [opt.webExtensionIds] - array of web extension IDs
   * @param {callback} [opt.callback] - callback after setup
   * @param {boolean} [opt.overwriteConfig] - overwrite config if exists
   */
  constructor(opt = {}) {
    const {
      browser, callback, chromeExtensionIds, configPath, hostDescription,
      hostName, mainScriptFile, overwriteConfig, webExtensionIds,
    } = opt;
    this._browser = isString(browser) && getBrowserData(browser) || null;
    this._configDir = isString(hostName) &&
                      path.join(DIR_CONFIG, hostName, "config") ||
                      path.join(DIR_CWD, "config");
    this._hostDesc = isString(hostDescription) && hostDescription || null;
    this._hostName = isString(hostName) && hostName || null;
    this._mainFile = isString(mainScriptFile) && mainScriptFile || "index.js";
    this._chromeExtIds = Array.isArray(chromeExtensionIds) &&
                         chromeExtensionIds.length && chromeExtensionIds ||
                         null;
    this._webExtIds = Array.isArray(webExtensionIds) &&
                      webExtensionIds.length && webExtensionIds || null;
    this._callback = typeof callback === "function" && callback || null;
    this._overwriteConfig = !!overwriteConfig;
    this._readline = readline;
    this._browserConfigDir;
    if (isString(configPath) && configPath.length) {
      this._setConfigDir(configPath);
    }
  }

  /* getter / setter */
  get browser() {
    let browser;
    if (this._browser) {
      const {alias} = this._browser;
      browser = alias;
    } else {
      browser = this._browser;
    }
    return browser;
  }
  set browser(browser) {
    this._browser = isString(browser) && getBrowserData(browser) || null;
  }

  get configPath() {
    return this._configDir;
  }
  set configPath(dir) {
    this._setConfigDir(dir);
  }

  get hostDescription() {
    return this._hostDesc;
  }
  set hostDescription(desc) {
    this._hostDesc = isString(desc) && desc || null;
  }

  get hostName() {
    return this._hostName;
  }
  set hostName(name) {
    this._hostName = isString(name) && name || null;
  }

  get mainScriptFile() {
    return this._mainFile;
  }
  set mainScriptFile(name) {
    this._mainFile = isString(name) && name || "index.js";
  }

  get chromeExtensionIds() {
    return this._chromeExtIds;
  }
  set chromeExtensionIds(arr) {
    this._chromeExtIds = Array.isArray(arr) && arr.length && arr || null;
  }

  get webExtensionIds() {
    return this._webExtIds;
  }
  set webExtensionIds(arr) {
    this._webExtIds = Array.isArray(arr) && arr.length && arr || null;
  }

  get callback() {
    return this._callback;
  }
  set callback(func) {
    this._callback = typeof func === "function" && func || null;
  }

  get overwriteConfig() {
    return this._overwriteConfig;
  }
  set overwriteConfig(overwrite) {
    this._overwriteConfig = !!overwrite;
  }

  /**
   * set config directory
   * @param {string} dir - directory path
   * @returns {void}
   */
  _setConfigDir(dir) {
    if (!isString(dir)) {
      throw new TypeError(`Expected String but got ${getType(dir)}.`);
    }
    const dirPath = getAbsPath(dir);
    if (!dirPath.startsWith(DIR_HOME)) {
      throw new Error(`${dirPath} is not sub directory of ${DIR_HOME}.`);
    }
    this._configDir = dirPath;
  }

  /**
   * get browser specific config directory
   * @returns {?string} - config directory
   */
  _getBrowserConfigDir() {
    let dir;
    if (this._browser) {
      const {
        alias, aliasLinux, aliasMac, aliasWin, hostLinux, hostMac, regWin,
      } = this._browser;
      const label = IS_WIN && regWin && (aliasWin || alias) ||
                    IS_MAC && hostMac && (aliasMac || alias) ||
                    !IS_WIN && !IS_MAC && hostLinux && (aliasLinux || alias);
      if (this._configDir && isString(label)) {
        dir = path.join(this._configDir, label);
      }
    }
    return dir || null;
  }

  /**
   * create registry
   * @param {string} manifestPath - manifest path
   * @returns {Object} - child process
   */
  async _createReg(manifestPath) {
    if (!isFile(manifestPath)) {
      throw new Error(`No such file: ${manifestPath}.`);
    }
    if (!this._browser) {
      throw new TypeError(`Expected Object but got ${getType(this._browser)}.`);
    }
    if (!isString(this._hostName)) {
      throw new TypeError(
        `Expected String but got ${getType(this._hostName)}.`,
      );
    }
    let proc;
    if (IS_WIN) {
      const {regWin} = this._browser;
      const regKey = path.join(...regWin, this._hostName);
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      const args = ["add", regKey, "/ve", "/d", manifestPath, "/f"];
      const opt = {
        cwd: null,
        encoding: CHAR,
        env: process.env,
      };
      values.set("regKey", regKey);
      proc = await new ChildProcess(reg, args, opt).spawn();
      proc.on("error", throwErr);
      proc.stderr.on("data", handleRegStderr);
      proc.on("close", handleRegClose);
    }
    return proc || null;
  }

  /**
   * create manifest
   * @param {string} shellPath - shell script path
   * @param {string} configDir - config directory path
   * @returns {string} - manifest path
   */
  async _createManifest(shellPath, configDir) {
    if (!isFile(shellPath)) {
      throw new Error(`No such file: ${shellPath}.`);
    }
    if (!this._browser) {
      throw new TypeError(`Expected Object but got ${getType(this._browser)}.`);
    }
    if (!isString(this._hostDesc)) {
      throw new TypeError(
        `Expected String but got ${getType(this._hostDesc)}.`,
      );
    }
    if (!isString(this._hostName)) {
      throw new TypeError(
        `Expected String but got ${getType(this._hostName)}.`,
      );
    }
    const {hostLinux, hostMac, type} = this._browser;
    const allowedField = {
      [EXT_CHROME]: {
        key: "allowed_origins",
        value: this._chromeExtIds,
      },
      [EXT_WEB]: {
        key: "allowed_extensions",
        value: this._webExtIds,
      },
    };
    const {key, value} = allowedField[type];
    if (!Array.isArray(value)) {
      throw new TypeError(`Expected Array but got ${getType(value)}.`);
    }
    const manifest = {
      [key]: [...value],
      description: this._hostDesc,
      name: this._hostName,
      path: shellPath,
      type: "stdio",
    };
    const content = `${JSON.stringify(manifest, null, INDENT)}\n`;
    const fileName = `${this._hostName}.json`;
    const hostDir = IS_MAC && path.join(...hostMac) ||
                    !IS_WIN && path.join(...hostLinux);
    if (IS_WIN && !isDir(configDir)) {
      throw new Error(`No such directory: ${configDir}.`);
    }
    const manifestPath = path.resolve(hostDir || configDir, fileName);
    hostDir && !isDir(hostDir) && await createDirectory(hostDir);
    await createFile(manifestPath, content, {
      encoding: CHAR, flag: "w", mode: PERM_FILE,
    });
    console.info(`Created: ${manifestPath}`);
    return manifestPath;
  }

  /**
   * create shell script
   * @param {string} configDir - config directory path
   * @returns {string} - shell script path
   */
  async _createShellScript(configDir) {
    if (!isDir(configDir)) {
      throw new Error(`No such directory: ${configDir}.`);
    }
    if (!isString(this._hostName)) {
      throw new TypeError(
        `Expected String but got ${getType(this._hostName)}.`,
      );
    }
    const appPath = process.execPath;
    const filePath = path.resolve(path.join(DIR_CWD, this._mainFile));
    const cmd = isFile(filePath) &&
                `${quoteArg(appPath)} ${quoteArg(filePath)}` ||
                quoteArg(appPath);
    const content = IS_WIN && `@echo off\n${cmd}\n` ||
                    `#!${process.env.SHELL}\n${cmd}\n`;
    const shellExt = IS_WIN && "cmd" || "sh";
    const shellPath = path.join(configDir, `${this._hostName}.${shellExt}`);
    await createFile(shellPath, content, {
      encoding: CHAR, flag: "w", mode: PERM_EXEC,
    });
    console.info(`Created: ${shellPath}`);
    return shellPath;
  }

  /**
   * create config directory
   * @returns {string} - config directory path
   */
  async _createConfigDir() {
    if (!isString(this._browserConfigDir)) {
      throw new TypeError(
        `Expected String but got ${getType(this._browserConfigDir)}.`,
      );
    }
    const configDir = await createDirectory(this._browserConfigDir, PERM_DIR);
    console.info(`Created: ${configDir}`);
    return configDir;
  }

  /**
   * create files
   * @returns {AsyncFunction|Function} - createReg(), handleSetupCallback(),
   *                                     abortSetup(),
   */
  async _createFiles() {
    let func;
    const configDir = await this._createConfigDir();
    const shellPath = await this._createShellScript(configDir);
    const manifestPath = await this._createManifest(shellPath, configDir);
    if (isDir(configDir) && isFile(shellPath) && isFile(manifestPath)) {
      values.set("configDir", configDir);
      values.set("shellPath", shellPath);
      values.set("manifestPath", manifestPath);
      values.set("callback", this._callback);
      func = IS_WIN && this._createReg(manifestPath) || handleSetupCallback();
    } else {
      func = abortSetup("Failed to create files.");
    }
    return func;
  }

  /**
   * handle browser config directory input
   * @returns {AsyncFunction|Function} - createFiles(), abortSetup()
   */
  async _handleBrowserConfigDir() {
    if (!isString(this._browserConfigDir)) {
      throw new TypeError(
        `Expected String but got ${getType(this._browserConfigDir)}.`,
      );
    }
    let func;
    if (isDir(this._browserConfigDir) && !this._overwriteConfig) {
      const dir = this._browserConfigDir;
      const ans =
        this._readline.keyInYNStrict(`${dir} already exists.\nOverwrite?`);
      if (ans) {
        func = this._createFiles();
      } else {
        func = abortSetup(`${dir} already exists.`);
      }
    } else {
      func = this._createFiles();
    }
    return func;
  }

  /**
   * handle browser input
   * @param {string} arr - browser array
   * @returns {AsyncFunction|Function} - handleBrowserConfigDir(), abortSetup()
   */
  async _handleBrowserInput(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError(`Expected Array but got ${getType(arr)}.`);
    }
    let func;
    const i = this._readline.keyInSelect(arr, "Select a browser.");
    if (Number.isInteger(i) && i >= 0) {
      this._browser = getBrowserData(arr[i]);
    }
    if (this._browser) {
      this._browserConfigDir = this._getBrowserConfigDir();
      func = this._handleBrowserConfigDir();
    } else {
      func = abortSetup("Browser is not specified.");
    }
    return func;
  }

  /**
   * run setup
   * @returns {AsyncFunction} - handleBrowserInput(), handleBrowserConfigDir()
   */
  run() {
    let func;
    this._browserConfigDir = this._getBrowserConfigDir();
    if (this._browserConfigDir) {
      func = this._handleBrowserConfigDir().catch(throwErr);
    } else {
      const arr = [];
      const items = Object.entries(browserData);
      for (const [item, obj] of items) {
        if ((IS_WIN && obj.regWin || IS_MAC && obj.hostMac ||
             !IS_WIN && !IS_MAC && obj.hostLinux) &&
            (obj.type === EXT_CHROME && this._chromeExtIds ||
             obj.type === EXT_WEB && this._webExtIds)) {
          arr.push(item);
        }
      }
      func = this._handleBrowserInput(arr).catch(throwErr);
    }
    return func;
  }
}

module.exports = {
  Setup,
  abortSetup, getBrowserData, handleRegClose, handleRegStderr,
  handleSetupCallback, values,
};
