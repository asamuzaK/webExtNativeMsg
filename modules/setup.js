/**
 * setup.js
 */
"use strict";
/* api */
const {ChildProcess} = require("./child-process");
const {browserData} = require("./browser-data");
const {getType, isString, logErr, quoteArg, throwErr} = require("./common");
const {
  createDirectory, createFile, getAbsPath, isDir, isFile,
} = require("./file-util");
const path = require("path");
const process = require("process");
const readline = require("readline");

/* constants */
const {
  CHAR, DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME,
  EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN,
} = require("./constant");
const DIR_CONFIG = IS_WIN && DIR_CONFIG_WIN || IS_MAC && DIR_CONFIG_MAC ||
                   DIR_CONFIG_LINUX;
const DIR_CWD = process.cwd();
const PERM_DIR = 0o700;
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;

/**
 * abort setup
 * @param {string} msg - message
 * @returns {void}
 */
const abortSetup = msg => {
  console.info(`Setup aborted: ${msg}`);
  process.exit(1);
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

/**
 * handle registry stderr
 * @param {*} data - data
 * @returns {void}
 */
const handleRegStderr = data => {
  if (IS_WIN) {
    const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
    data && console.error(`stderr: ${reg}: ${data}`);
  }
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
    this._readline;
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
    const dirPath = getAbsPath(dir);
    if (!isString(dirPath)) {
      throw new Error(`Failed to normalize ${dir}`);
    }
    if (!dirPath.startsWith(DIR_HOME)) {
      throw new Error(`${dirPath} is not sub directory of ${DIR_HOME}.`);
    }
    this._configDir = dirPath;
  }

  /**
   * handle setup callback
   * @returns {?Function} - callback
   */
  _handleSetupCallback() {
    let func;
    if (typeof this._callback === "function") {
      func = this._callback({
        configDirPath: this._configPath,
        shellScriptPath: this._shellPath,
        manifestPath: this._manifestPath,
      });
    }
    return func || null;
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
   * handle create registry close
   * @param {number} code - exit code
   * @returns {?AsyncFunction} - handleSetupCallback()
   */
  _handleRegClose(code) {
    let func;
    if (IS_WIN) {
      if (code === 0) {
        const {regWin} = this._browser;
        const regKey = path.join(...regWin, this._hostName);
        console.info(`Created: ${regKey}`);
        func = this._handleSetupCallback();
      } else {
        const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
        console.warn(`${reg} exited with ${code}.`);
      }
    }
    return func || null;
  }

  /**
   * create registry
   * @param {string} manifestPath - manifest file path
   * @param {Array} regWin - reg dir array
   * @returns {Object} - child process
   */
  async _createReg(manifestPath, regWin) {
    if (!isString(manifestPath)) {
      throw new TypeError(`Expected String but got ${getType(manifestPath)}.`);
    }
    if (!Array.isArray(regWin)) {
      throw new TypeError(`Expected Array but got ${getType(regWin)}.`);
    }
    let proc;
    if (IS_WIN) {
      if (!isString(this._hostName)) {
        throw new TypeError(
          `Expected String but got ${getType(this._hostName)}.`
        );
      }
      const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
      const regKey = path.join(...regWin, this._hostName);
      const args = ["add", regKey, "/ve", "/d", manifestPath, "/f"];
      const opt = {
        cwd: null,
        encoding: CHAR,
        env: process.env,
      };
      proc = await (new ChildProcess(reg, args, opt)).spawn();
      proc.on("error", throwErr);
      proc.stderr.on("data", handleRegStderr);
      proc.on("close", this._handleRegClose);
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
        `Expected String but got ${getType(this._hostDesc)}.`
      );
    }
    if (!isString(this._hostName)) {
      throw new TypeError(
        `Expected String but got ${getType(this._hostName)}.`
      );
    }
    const {hostLinux, hostMac, regWin, type} = this._browser;
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
    const hostDir = IS_MAC && hostMac || !IS_WIN && hostLinux;
    const hostDirPath = hostDir && path.join(...hostDir);
    if (IS_WIN && !isDir(configDir)) {
      throw new Error(`No such directory: ${configDir}.`);
    }
    const filePath = path.resolve(hostDirPath || configDir, fileName);
    hostDirPath && !isDir(hostDirPath) && await createDirectory(hostDirPath) ||
    IS_WIN && await this._createReg(filePath, regWin);
    const manifestPath = await createFile(filePath, content, {
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
        `Expected String but got ${getType(this._hostName)}.`
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
    const shellScriptPath = await createFile(shellPath, content, {
      encoding: CHAR, flag: "w", mode: PERM_EXEC,
    });
    console.info(`Created: ${shellScriptPath}`);
    return shellScriptPath;
  }

  /**
   * create config directory
   * @returns {string} - config directory path
   */
  async _createConfigDir() {
    if (!isString(this._browserConfigDir)) {
      throw new TypeError(
        `Expected String but got ${getType(this._browserConfigDir)}.`
      );
    }
    const configDir = await createDirectory(this._browserConfigDir, PERM_DIR);
    console.info(`Created: ${configDir}`);
    return configDir;
  }

  /**
   * create files
   * @returns {?AsyncFunction} - handleSetupCallback()
   */
  async _createFiles() {
    let func;
    const configDir = await this._createConfigDir();
    const shellPath = await this._createShellScript(configDir);
    const manifestPath = await this._createManifest(shellPath, configDir);
    if (isString(manifestPath)) {
      func = !IS_WIN && this._handleSetupCallback();
    }
    return func || null;
  }

  /**
   * handle browser config directory input
   * @param {string} ans - user input
   * @returns {AsyncFunction|Function} - createFiles() / abortSetup()
   */
  _handleBrowserConfigDir(ans) {
    let func;
    const msg = `${this._browserConfigDir} already exists.`;
    this._readline && this._readline.close();
    if (isString(ans)) {
      ans = ans.trim();
      if (/^y(?:es)?$/i.test(ans)) {
        func = this._createFiles().catch(logErr);
      } else {
        func = abortSetup(msg);
      }
    } else {
      func = abortSetup(msg);
    }
    return func;
  }

  /**
   * handle browser input
   * @param {string} ans - user input
   * @returns {AsyncFunction|Function} - createFiles() / rl.question() /
   *                                     abortSetup()
   */
  _handleBrowserInput(ans) {
    const msg = "Browser not specified.";
    let func;
    if (isString(ans)) {
      ans = ans.trim();
      if (ans.length) {
        this._browser = getBrowserData(ans);
        if (this._browser) {
          this._browserConfigDir = this._getBrowserConfigDir();
          if (isDir(this._browserConfigDir) && this._readline &&
              !this._overwriteConfig) {
            func = this._readline.question(
              `${this._browserConfigDir} already exists. Overwrite? [y/n]\n`,
              this._handleBrowserConfigDir
            );
          } else {
            this._readline && this._readline.close();
            func = this._createFiles().catch(logErr);
          }
        } else {
          this._readline && this._readline.close();
          func = abortSetup(`${ans} not supported.`);
        }
      } else {
        this._readline && this._readline.close();
        func = abortSetup(msg);
      }
    } else {
      this._readline && this._readline.close();
      func = abortSetup(msg);
    }
    return func;
  }

  /**
   * run setup
   * @returns {?AsyncFunction} - createFiles()
   */
  run() {
    let func;
    this._readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    if (this._browser) {
      this._browserConfigDir = this._getBrowserConfigDir();
      if (isDir(this._browserConfigDir) && !this._overwriteConfig) {
        this._readline.question(
          `${this._browserConfigDir} already exists. Overwrite? [y/n]\n`,
          this._handleBrowserConfigDir
        );
      } else {
        this._readline.close();
        func = this._createFiles().catch(logErr);
      }
    } else {
      const arr = [];
      const msg =
        "Enter which browser you would like to set up the host for:\n";
      const items = Object.entries(browserData);
      for (const [item, obj] of items) {
        if ((IS_WIN && obj.regWin || IS_MAC && obj.hostMac ||
             !IS_WIN && !IS_MAC && obj.hostLinux) &&
            (obj.type === EXT_CHROME && this._chromeExtIds ||
             obj.type === EXT_WEB && this._webExtIds)) {
          arr.push(item);
        }
      }
      this._readline.question(
        `${msg}[${arr.join(" ")}]\n`,
        this._handleBrowserInput
      );
    }
    return func || null;
  }
}

module.exports = {
  Setup,
  abortSetup, getBrowserData, handleRegStderr,
};
