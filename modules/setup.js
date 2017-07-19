/**
 * setup.js
 */
"use strict";
{
  /* api */
  const {ChildProcess} = require("./child-process");
  const {browserData} = require("./browser-data");
  const {escapeChar, getType, isString, logError} = require("./common");
  const {
    createDir, createFile, getAbsPath, isDir, isFile,
  } = require("./file-util");
  const os = require("os");
  const path = require("path");
  const process = require("process");
  const readline = require("readline");

  /* constants */
  const CHAR = "utf8";
  const DIR_CWD = process.cwd();
  const DIR_HOME = os.homedir();
  const EXT_CHROME = "chromeExtension";
  const EXT_WEB = "webExtension";
  const IS_MAC = os.platform() === "darwin";
  const IS_WIN = os.platform() === "win32";
  const PERM_DIR = 0o700;
  const PERM_EXEC = 0o700;
  const PERM_FILE = 0o600;

  /* variables */
  const vars = {
    browser: null,
    configDir: null,
    hostDesc: null,
    hostName: null,
    mainFile: null,
    chromeExtIds: null,
    webExtIds: null,
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
    let dir;
    const {browser, configDir} = vars;
    if (browser) {
      const {alias, aliasLinux, aliasMac, aliasWin} = browser;
      dir = IS_WIN && [...configDir, aliasWin || alias] ||
            IS_MAC && [...configDir, aliasMac || alias] ||
            [...configDir, aliasLinux || alias];
    }
    return dir || null;
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
    return configPath;
  };

  /**
   * create shell script
   * @param {string} configPath - config directory path
   * @returns {string} - shell script path
   */
  const createShellScript = async configPath => {
    const {hostName, mainFile} = vars;
    if (await !isDir(configPath)) {
      throw new Error(`No such directory: ${configPath}.`);
    }
    if (!isString(mainFile)) {
      throw new TypeError(
        `Expected String but got ${getType(mainFile)}.`
      );
    }
    const shellExt = IS_WIN && "cmd" || "sh";
    const shellPath = path.join(configPath, `${hostName}.${shellExt}`);
    const indexPath = path.resolve(path.join(DIR_CWD, mainFile));
    let file;
    if (await isFile(indexPath)) {
      const node = process.argv0;
      const cmd = `${node} ${indexPath}`;
      const content = IS_WIN && `@echo off\n${cmd}\n` ||
                      `#!/usr/bin/env bash\n${cmd}\n`;
      file = await createFile(
        shellPath, content, {encoding: CHAR, flag: "w", mode: PERM_EXEC}
      );
    }
    if (!file) {
      throw new Error(`Failed to create ${shellPath}.`);
    }
    console.info(`Created: ${shellPath}`);
    return shellPath;
  };

  /**
   * create app manifest
   * @returns {string} - app manifest path
   */
  const createAppManifest = async () => {
    const {browser, hostDesc, hostName, chromeExtIds, webExtIds} = vars;
    if (!browser) {
      throw new Error(`Expected Object but got ${getType(browser)}.`);
    }
    if (!isString(hostDesc)) {
      throw new TypeError(
        `Expected String but got ${getType(hostDesc)}.`
      );
    }
    if (!isString(hostName)) {
      throw new TypeError(
        `Expected String but got ${getType(hostName)}.`
      );
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
    });
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
    return filePath;
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
    process.exit(1);
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
        rl.close();
        createAppManifest().catch(logError);
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
            rl.close();
            createAppManifest().catch(logError);
          }
        } else {
          // TODO: Add custom setup
          abortSetup(`${ans} not supported.`);
        }
      } else {
        abortSetup(msg);
      }
    } else {
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

  /* setup class */
  class Setup {
    /**
     * setup options
     * @param {Object} opt - options
     * @param {string} opt.mainScriptFile - file name of the main script
     * @param {Array} opt.chromeExtensionIds - Array of chrome extension IDs
     * @param {Array} opt.webExtensionIds - Array of web extension IDs
     */
    constructor(opt = {}) {
      const {
        hostDescription: hostDesc, hostName, mainScriptFile: mainFile,
        chromeExtensionIds: chromeExtIds, webExtensionIds: webExtIds,
      } = opt;
      this._browser = null;
      this._configDir = [DIR_CWD, "config"];
      this._hostDesc = isString(hostDesc) && hostDesc || null;
      this._hostName = isString(hostName) && hostName || null;
      this._mainFile = isString(mainFile) && mainFile || "index.js";
      this._chromeExtIds = Array.isArray(chromeExtIds) && chromeExtIds.length &&
                           chromeExtIds || null;
      this._webExtIds = Array.isArray(webExtIds) && webExtIds.length &&
                        webExtIds || null;
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
    get mainFile() {
      return this._mainFile;
    }
    set mainFile(name) {
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

    /**
     * set config directory
     * @param {string} dir - directory path
     * @returns {void}
     */
    setConfigDir(dir) {
      const configPath = getAbsPath(dir);
      if (!configPath) {
        throw new Error(`Failed to normalize ${dir}`);
      }
      if (!configPath.startsWith(DIR_HOME)) {
        throw new Error(`Config path is not sub directory of ${DIR_HOME}.`);
      }
      const homeDir = escapeChar(DIR_HOME, /(\\)/g);
      const reHomeDir = new RegExp(`^(?:${homeDir}|~)`);
      const subDir = (configPath.replace(reHomeDir, "")).split(path.sep)
        .filter(i => i);
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
          rl.close();
          createAppManifest().catch(logError);
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
  };
}
