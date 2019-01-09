/**
 * setup.js
 */
"use strict";
/* api */
const {ChildProcess} = require("./child-process");
const {browserData} = require("./browser-data");
const {
  escapeChar, getType, isString, logErr, quoteArg, throwErr,
} = require("./common");
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

/* variables */
const vars = {
  browser: null,
  callback: null,
  chromeExtIds: null,
  configDir: null,
  configPath: null,
  hostDesc: null,
  hostName: null,
  mainFile: null,
  manifestPath: null,
  overwriteConfig: false,
  rl: null,
  shellPath: null,
  webExtIds: null,
};

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
    const items = Object.keys(browserData);
    for (const item of items) {
      if (item === key) {
        const obj = browserData[item];
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
 * get browser specific config directory
 * @returns {?Array} - config directory array
 */
const getBrowserConfigDir = () => {
  const {browser, configDir} = vars;
  let dir;
  if (browser && Array.isArray(configDir)) {
    const {alias, aliasLinux, aliasMac, aliasWin} = browser;
    if (isString(alias)) {
      dir =
        IS_WIN && [...configDir, isString(aliasWin) && aliasWin || alias] ||
        IS_MAC && [...configDir, isString(aliasMac) && aliasMac || alias] ||
        [...configDir, isString(aliasLinux) && aliasLinux || alias];
    }
  }
  return dir || null;
};

/**
 * handle setup callback
 * @returns {?Function} - callback
 */
const handleSetupCallback = () => {
  const {
    callback, configPath: configDirPath, shellPath: shellScriptPath,
    manifestPath,
  } = vars;
  let func;
  if (typeof callback === "function") {
    func = callback({configDirPath, shellScriptPath, manifestPath});
  }
  return func || null;
};

/**
 * create config directory
 * @returns {string} - config directory path
 */
const createConfig = async () => {
  const dir = await getBrowserConfigDir();
  if (!Array.isArray(dir)) {
    throw new TypeError(`Expected Array but got ${getType(dir)}.`);
  }
  const configPath = await createDirectory(path.join(...dir), PERM_DIR);
  if (await !isDir(configPath)) {
    throw new Error(`Failed to create ${path.join(dir)}.`);
  }
  console.info(`Created: ${configPath}`);
  vars.configPath = configPath;
  return configPath;
};

/**
 * create shell script
 * @param {string} configPath - config directory path
 * @returns {string} - shell script path
 */
const createShellScript = async configPath => {
  if (await !isDir(configPath)) {
    throw new Error(`No such directory: ${configPath}.`);
  }
  const {hostName, mainFile} = vars;
  if (!isString(hostName)) {
    throw new TypeError(`Expected String but got ${getType(hostName)}.`);
  }
  if (!isString(mainFile)) {
    throw new TypeError(`Expected String but got ${getType(mainFile)}.`);
  }
  const shellExt = IS_WIN && "cmd" || "sh";
  const shellPath = path.join(configPath, `${hostName}.${shellExt}`);
  const appPath = process.execPath;
  const filePath = path.resolve(path.join(DIR_CWD, mainFile));
  let cmd, content;
  if (await isFile(filePath)) {
    cmd = `${quoteArg(appPath)} ${quoteArg(filePath)}`;
  } else {
    cmd = quoteArg(appPath);
  }
  if (IS_WIN) {
    content = `@echo off\n${cmd}\n`;
  } else {
    const envShell = process.env.SHELL;
    content = `#!${envShell}\n${cmd}\n`;
  }
  const file = await createFile(
    shellPath, content, {encoding: CHAR, flag: "w", mode: PERM_EXEC}
  );
  if (!file) {
    throw new Error(`Failed to create ${shellPath}.`);
  }
  console.info(`Created: ${shellPath}`);
  vars.shellPath = shellPath;
  return shellPath;
};

/**
 * handle create registry stderr
 * @param {*} data - data
 * @returns {void}
 */
const handleRegStderr = data => {
  if (IS_WIN) {
    const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
    data && console.error(`stderr: ${reg}: ${data}`);
  }
};

/**
 * handle create registry close
 * @param {number} code - exit code
 * @returns {void}
 */
const handleRegClose = code => {
  if (code === 0 && IS_WIN) {
    const {browser, hostName} = vars;
    const {regWin} = browser;
    const regKey = path.join(...regWin, hostName);
    console.info(`Created: ${regKey}`);
    handleSetupCallback();
  } else if (IS_WIN) {
    const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
    console.warn(`${reg} exited with ${code}.`);
  }
};

/**
 * create registry
 * @param {string} hostName - host name
 * @param {string} manifestPath - manifest file path
 * @param {Array} regWin - reg dir array
 * @returns {Object} - child process
 */
const createReg = async (hostName, manifestPath, regWin) => {
  if (!isString(hostName)) {
    throw new TypeError(`Expected String but got ${getType(hostName)}.`);
  }
  if (!isString(manifestPath)) {
    throw new TypeError(`Expected String but got ${getType(manifestPath)}.`);
  }
  if (!Array.isArray(regWin)) {
    throw new TypeError(`Expected Array but got ${getType(regWin)}.`);
  }
  let proc;
  if (IS_WIN) {
    const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
    const regKey = path.join(...regWin, hostName);
    const args = ["add", regKey, "/ve", "/d", manifestPath, "/f"];
    const opt = {
      cwd: null,
      encoding: CHAR,
      env: process.env,
    };
    proc = await (new ChildProcess(reg, args, opt)).spawn();
    proc.on("error", throwErr);
    proc.stderr.on("data", handleRegStderr);
    proc.on("close", handleRegClose);
  }
  return proc || null;
};

/**
 * create files
 * @returns {void}
 */
const createFiles = async () => {
  const {browser, hostDesc, hostName, chromeExtIds, webExtIds} = vars;
  if (!browser) {
    throw new Error(`Expected Object but got ${getType(browser)}.`);
  }
  if (!isString(hostDesc)) {
    throw new TypeError(`Expected String but got ${getType(hostDesc)}.`);
  }
  if (!isString(hostName)) {
    throw new TypeError(`Expected String but got ${getType(hostName)}.`);
  }
  const configPath = await createConfig();
  const shellPath = await createShellScript(configPath);
  const {hostLinux, hostMac, regWin, type} = browser;
  const allowedField = {
    [EXT_CHROME]: {
      key: "allowed_origins",
      value: chromeExtIds,
    },
    [EXT_WEB]: {
      key: "allowed_extensions",
      value: webExtIds,
    },
  };
  const {key, value} = allowedField[type];
  if (!Array.isArray(value)) {
    throw new TypeError(`Expected Array but got ${getType(value)}.`);
  }
  const manifest = {
    [key]: [...value],
    description: hostDesc,
    name: hostName,
    path: shellPath,
    type: "stdio",
  };
  const content = `${JSON.stringify(manifest, null, INDENT)}\n`;
  const fileName = `${hostName}.json`;
  const manifestPath = path.resolve(
    IS_WIN && path.join(configPath, fileName) ||
    IS_MAC && path.join(...hostMac, fileName) ||
    path.join(...hostLinux, fileName)
  );
  if (IS_WIN) {
    await createReg(hostName, manifestPath, regWin);
  } else {
    const hostDir = IS_MAC && hostMac || hostLinux;
    const hostDirPath = await createDirectory(path.join(...hostDir), PERM_DIR);
    if (await !isDir(hostDirPath)) {
      throw new Error(`Failed to create ${path.join(...hostDir)}.`);
    }
  }
  const file = await createFile(
    manifestPath, content, {encoding: CHAR, flag: "w", mode: PERM_FILE}
  );
  if (!file) {
    throw new Error(`Failed to create ${manifestPath}.`);
  }
  console.info(`Created: ${manifestPath}`);
  vars.manifestPath = manifestPath;
  !IS_WIN && handleSetupCallback();
};

/**
 * handle browser config directory input
 * @param {string} ans - user input
 * @returns {void}
 */
const handleBrowserConfigDir = ans => {
  const dir = getBrowserConfigDir();
  if (!Array.isArray(dir)) {
    throw new TypeError(`Expected Array but got ${getType(dir)}.`);
  }
  const {rl} = vars;
  const msg = `${path.join(...dir)} already exists.`;
  rl && rl.close();
  if (isString(ans)) {
    ans = ans.trim();
    if (/^y(?:es)?$/i.test(ans)) {
      createFiles().catch(logErr);
    } else {
      abortSetup(msg);
    }
  } else {
    abortSetup(msg);
  }
};

/**
 * handle browser input
 * @param {string} ans - user input
 * @returns {void}
 */
const handleBrowserInput = ans => {
  const {overwriteConfig, rl} = vars;
  const msg = "Browser not specified.";
  if (isString(ans)) {
    ans = ans.trim();
    if (ans.length) {
      const browser = getBrowserData(ans);
      browser && (vars.browser = browser);
      if (browser) {
        const dir = getBrowserConfigDir();
        if (!Array.isArray(dir)) {
          throw new TypeError(`Expected Array but got ${getType(dir)}.`);
        }
        const dirPath = path.join(...dir);
        if (isDir(dirPath) && rl && !overwriteConfig) {
          rl.question(`${dirPath} already exists. Overwrite? [y/n]\n`,
                      handleBrowserConfigDir);
        } else {
          rl && rl.close();
          createFiles().catch(logErr);
        }
      } else {
        // TODO: Add custom setup
        rl && rl.close();
        abortSetup(`${ans} not supported.`);
      }
    } else {
      rl && rl.close();
      abortSetup(msg);
    }
  } else {
    rl && rl.close();
    abortSetup(msg);
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
                      [DIR_CONFIG, hostName, "config"] || [DIR_CWD, "config"];
    this._overwriteConfig = !!overwriteConfig;
    this._hostDesc = isString(hostDescription) && hostDescription || null;
    this._hostName = isString(hostName) && hostName || null;
    this._mainFile = isString(mainScriptFile) && mainScriptFile || "index.js";
    this._chromeExtIds = Array.isArray(chromeExtensionIds) &&
                         chromeExtensionIds.length && chromeExtensionIds ||
                         null;
    this._webExtIds = Array.isArray(webExtensionIds) &&
                      webExtensionIds.length && webExtensionIds || null;
    this._callback = typeof callback === "function" && callback || null;
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
    vars.browser = this._browser;
  }
  get configPath() {
    return path.join(...this._configDir);
  }
  set configPath(dir) {
    this._setConfigDir(dir);
  }
  get hostDescription() {
    return this._hostDesc;
  }
  set hostDescription(desc) {
    this._hostDesc = isString(desc) && desc || null;
    vars.hostDesc = this._hostDesc;
  }
  get hostName() {
    return this._hostName;
  }
  set hostName(name) {
    this._hostName = isString(name) && name || null;
    vars.hostName = this._hostName;
  }
  get mainScriptFile() {
    return this._mainFile;
  }
  set mainScriptFile(name) {
    this._mainFile = isString(name) && name || null;
    vars.mainFile = this._mainFile;
  }
  get chromeExtensionIds() {
    return this._chromeExtIds;
  }
  set chromeExtensionIds(arr) {
    this._chromeExtIds = Array.isArray(arr) && arr.length && arr || null;
    vars.chromeExtIds = this._chromeExtIds;
  }
  get webExtensionIds() {
    return this._webExtIds;
  }
  set webExtensionIds(arr) {
    this._webExtIds = Array.isArray(arr) && arr.length && arr || null;
    vars.webExtIds = this._webExtIds;
  }
  get callback() {
    return this._callback;
  }
  set callback(func) {
    this._callback = typeof func === "function" && func || null;
    vars.callback = this._callback;
  }
  get overwriteConfig() {
    return this._overwriteConfig;
  }
  set overwriteConfig(overwrite) {
    this._overwriteConfig = !!overwrite;
    vars.overwriteConfig = this._overwriteConfig;
  }

  /**
   * set config directory
   * @param {string} dir - directory path
   * @returns {void}
   */
  _setConfigDir(dir) {
    const dirPath = getAbsPath(dir);
    if (!dirPath) {
      throw new Error(`Failed to normalize ${dir}`);
    }
    if (!dirPath.startsWith(DIR_HOME)) {
      throw new Error(`Config path is not sub directory of ${DIR_HOME}.`);
    }
    const homeDir = escapeChar(DIR_HOME, /(\\)/g);
    const reg = new RegExp(`^(?:${homeDir}|~)`);
    const subDir = dirPath.replace(reg, "").split(path.sep).filter(i => i);
    this._configDir = subDir.length && [DIR_HOME, ...subDir] || [DIR_HOME];
    vars.configDir = this._configDir;
  }

  /**
   * run setup
   * @returns {?AsyncFunction} - createFiles()
   */
  run() {
    let func;
    vars.browser = this._browser;
    vars.callback = this._callback;
    vars.chromeExtIds = this._chromeExtIds;
    vars.configDir = this._configDir;
    vars.hostDesc = this._hostDesc;
    vars.hostName = this._hostName;
    vars.mainFile = this._mainFile;
    vars.overwriteConfig = this._overwriteConfig;
    vars.webExtIds = this._webExtIds;
    vars.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    if (!vars.rl) {
      throw new Error("Failed to run setup.");
    }
    if (this._browser) {
      const dir = getBrowserConfigDir();
      if (!Array.isArray(dir)) {
        throw new TypeError(`Expected Array but got ${getType(dir)}.`);
      }
      const dirPath = path.join(...dir);
      if (isDir(dirPath) && !this._overwriteConfig) {
        vars.rl.question(`${dirPath} already exists. Overwrite? [y/n]\n`,
                         handleBrowserConfigDir);
      } else {
        vars.rl.close();
        func = createFiles().catch(logErr);
      }
    } else {
      const arr = [];
      const msg =
        "Enter which browser you would like to set up the host for:\n";
      const items = Object.keys(browserData);
      for (const item of items) {
        const obj = browserData[item];
        if ((IS_WIN && obj.regWin || IS_MAC && obj.hostMac ||
             !IS_WIN && !IS_MAC && obj.hostLinux) &&
            (obj.type === EXT_CHROME && this._chromeExtIds ||
             obj.type === EXT_WEB && this._webExtIds)) {
          arr.push(item);
        }
      }
      vars.rl.question(`${msg}[${arr.join(" ")}]\n`, handleBrowserInput);
    }
    return func || null;
  }
}

module.exports = {
  Setup,
};
