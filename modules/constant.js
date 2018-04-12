/**
 * constants.js
 */
"use strict";
/* api */
const os = require("os");

/* constants */
const CHAR = "utf8";
const DIR_HOME = os.homedir();
const EXT_CHROME = "chromeExtension";
const EXT_WEB = "webExtension";
const INDENT = 2;
const IS_BE = os.endianness() === "BE";
const IS_LE = os.endianness() === "LE";
const IS_MAC = os.platform() === "darwin";
const IS_WIN = os.platform() === "win32";
const DIR_CONFIG = IS_WIN && [DIR_HOME, "AppData", "Roaming"] ||
                   IS_MAC && [DIR_HOME, "Library", "Application Support"] ||
                   [DIR_HOME, ".config"];

module.exports = {
  CHAR, DIR_CONFIG, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_BE, IS_LE,
  IS_MAC, IS_WIN,
};
