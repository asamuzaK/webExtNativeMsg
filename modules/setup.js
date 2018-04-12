/**
 * setup.js
 */
"use strict";
/* api */
const {ChildProcess} = require("./child-process");
const {browserData} = require("./browser-data");
const {escapeChar, getType, isString, logErr, quoteArg} = require("./common");
const {
  createDir, createFile, getAbsPath, isDir, isFile, removeDir,
} = require("./file-util");
const path = require("path");
const process = require("process");
const readline = require("readline");

/* constants */
const {
  CHAR, DIR_CONFIG, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN,
} = require("./constant");
const DIR_CWD = process.cwd();
const OLD_CONFIG = path.join(DIR_CWD, "config");
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
  shellPath: null,
  webExtIds: null,
};

/* readline */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * abort setup
 * @param {string} msg - message
 * @returns {void}
 */
const abortSetup = msg => {
  console.info(`Setup aborted: ${msg}`);
  rl && rl.close();
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
 * @returns {void}
 */
const handleSetupCallback = () => {
  const {
    callback, configPath: configDirPath, shellPath: shellScriptPath,
    manifestPath,
  } = vars;
  callback && callback({configDirPath, shellScriptPath, manifestPath});
};

/**
 * handle old config
 * @param {string} ans - user input
 * @returns {void}
 */
const handleOldConfig = ans => {
  if (isString(ans)) {
    ans = ans.trim();
    if (/^y(?:es)?$/i.test(ans)) {
      try {
        removeDir(OLD_CONFIG, DIR_CWD);
      } catch (e) {
        logErr(`Failed to remove directory: ${e.message}`);
      }
    }
  }
  rl.close();
  handleSetupCallback();
};

/**
 * check old config
 * @returns {void}
 */
const checkOldConfig = () => {
  const {configDir} = vars;
  if (Array.isArray(configDir) && path.join(...configDir) !== OLD_CONFIG &&
      isDir(OLD_CONFIG)) {
    rl.question(`Found old config directory ${OLD_CONFIG}. Remove? [y/n]\n`,
                handleOldConfig);
  } else {
    rl.close();
    handleSetupCallback();
  }
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
  const configPath = await createDir(dir, PERM_DIR);
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
  let cmd;
  if (await isFile(filePath)) {
    cmd = `${quoteArg(appPath)} ${quoteArg(filePath)}`;
  } else {
    cmd = quoteArg(appPath);
  }
  const content = IS_WIN && `@echo off\n${cmd}\n` ||
                  `#!/usr/bin/env bash\n${cmd}\n`;
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
  const manifest = JSON.stringify({
    [key]: [...value],
    description: hostDesc,
    name: hostName,
    path: shellPath,
    type: "stdio",
  }, null, INDENT);
  const fileName = `${hostName}.json`;
  const filePath = path.resolve(
    IS_WIN && path.join(configPath, fileName) ||
    IS_MAC && path.join(...hostMac, fileName) ||
    path.join(...hostLinux, fileName)
  );
  if (IS_WIN) {
    const reg = path.join(process.env.WINDIR, "system32", "reg.exe");
    const regKey = path.join(...regWin, hostName);
    const args = ["add", regKey, "/ve", "/d", filePath, "/f"];
    const opt = {
      cwd: null,
      encoding: CHAR,
      env: process.env,
    };
    const proc = await (new ChildProcess(reg, args, opt)).spawn();
    proc.on("error", e => {
      throw e;
    });
    proc.stderr.on("data", data => {
      data && console.error(`stderr: ${reg}: ${data}`);
    });
    proc.on("close", code => {
      if (code === 0) {
        console.info(`Created: ${regKey}`);
        checkOldConfig();
      } else {
        console.warn(`${reg} exited with ${code}.`);
      }
    });
  } else {
    const hostDir = IS_MAC && hostMac || hostLinux;
    const hostDirPath = await createDir(hostDir, PERM_DIR);
    if (await !isDir(hostDirPath)) {
      throw new Error(`Failed to create ${path.join(...hostDir)}.`);
    }
  }
  const file = await createFile(
    filePath, manifest, {encoding: CHAR, flag: "w", mode: PERM_FILE}
  );
  if (!file) {
    throw new Error(`Failed to create ${filePath}.`);
  }
  console.info(`Created: ${filePath}`);
  vars.manifestPath = filePath;
  !IS_WIN && checkOldConfig();
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
  const msg = `${path.join(...dir)} already exists.`;
  if (isString(ans)) {
    ans = ans.trim();
    if (/^y(?:es)?$/i.test(ans)) {
      createFiles().catch(logErr);
    } else {
      rl.close();
      abortSetup(msg);
    }
  } else {
    rl.close();
    abortSetup(msg);
  }
};

/**
 * handle browser input
 * @param {string} ans - user input
 * @returns {void}
 */
const handleBrowserInput = ans => {
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
        if (isDir(dirPath)) {
          rl.question(`${dirPath} already exists. Overwrite? [y/n]\n`,
                      handleBrowserConfigDir);
        } else {
          createFiles().catch(logErr);
        }
      } else {
        // TODO: Add custom setup
        rl.close();
        abortSetup(`${ans} not supported.`);
      }
    } else {
      rl.close();
      abortSetup(msg);
    }
  } else {
    rl.close();
    abortSetup(msg);
  }
};

/**
 * extract argument
 * @param {string} arg - argument in key=value format
 * @param {RegExp} re - RegExp
 * @returns {string} - argument value
 */
const extractArg = (arg, re) => {
  let value;
  if (isString(arg) && re && re.ignoreCase) {
    arg = re.exec(arg.trim());
    arg && ([, value] = arg);
  }
  return value || null;
};

/* Setup */
class Setup {
  /**
   * setup options
   * @param {Object} [opt] - options
   * @param {string} [opt.hostDescription] - host description
   * @param {string} [opt.hostName] - host name
   * @param {string} [opt.mainScriptFile] - file name of the main script
   * @param {Array} [opt.chromeExtensionIds] - Array of chrome extension IDs
   * @param {Array} [opt.webExtensionIds] - Array of web extension IDs
   */
  constructor(opt = {}) {
    const {
      callback, hostDescription, hostName, mainScriptFile,
      chromeExtensionIds, webExtensionIds,
    } = opt;
    this._browser = null;
    this._configDir = isString(hostName) &&
                      [...DIR_CONFIG, hostName, "config"] ||
                      [DIR_CWD, "config"];
    this._hostDesc = isString(hostDescription) && hostDescription || null;
    this._hostName = isString(hostName) && hostName || null;
    this._mainFile = isString(mainScriptFile) && mainScriptFile || "index.js";
    this._chromeExtIds = Array.isArray(chromeExtensionIds) &&
                         chromeExtensionIds.length && chromeExtensionIds ||
                         null;
    this._webExtIds = Array.isArray(webExtensionIds) &&
                      webExtensionIds.length && webExtensionIds || null;
    this._callback = typeof callback === "function" && callback || null;
  }

  /* getter / setter */
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

  /**
   * set config directory
   * @param {string} dir - directory path
   * @returns {void}
   */
  setConfigDir(dir) {
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
   * @returns {void}
   */
  run() {
    const [, , ...args] = process.argv;
    if (Array.isArray(args) && args.length) {
      for (const arg of args) {
        let value;
        if (/^--browser=/i.test(arg)) {
          value = extractArg(arg, /^--browser=(.+)$/i);
          value && (this._browser = getBrowserData(value));
        } else if (/^--config-path=/i.test(arg)) {
          value = extractArg(arg, /^--config-path=(.+)$/i);
          value && this.setConfigDir(value);
        }
      }
    }
    vars.browser = this._browser;
    vars.callback = this._callback;
    vars.configDir = this._configDir;
    vars.hostDesc = this._hostDesc;
    vars.hostName = this._hostName;
    vars.mainFile = this._mainFile;
    vars.chromeExtIds = this._chromeExtIds;
    vars.webExtIds = this._webExtIds;
    if (this._browser) {
      const dir = getBrowserConfigDir();
      if (!Array.isArray(dir)) {
        throw new TypeError(`Expected Array but got ${getType(dir)}.`);
      }
      const dirPath = path.join(...dir);
      if (isDir(dirPath)) {
        rl.question(`${dirPath} already exists. Overwrite? [y/n]\n`,
                    handleBrowserConfigDir);
      } else {
        createFiles().catch(logErr);
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
      rl.question(`${msg}[${arr.join(" ")}]\n`, handleBrowserInput);
    }
  }
}

module.exports = {
  Setup,
  abortSetup,
  checkOldConfig,
  createConfig,
  createFiles,
  createShellScript,
  extractArg,
  getBrowserConfigDir,
  getBrowserData,
  handleBrowserConfigDir,
  handleBrowserInput,
  handleOldConfig,
  handleSetupCallback,
  setupReadline: rl,
};
