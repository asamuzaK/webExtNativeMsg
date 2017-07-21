/**
 * constants.js
 */
"use strict";
{
  /* api */
  const os = require("os");

  module.exports = {
    CHAR: "utf8",
    DIR_HOME: os.homedir(),
    EXT_CHROME: "chromeExtension",
    EXT_WEB: "webExtension",
    INDENT: 2,
    IS_BE: os.endianness() === "BE",
    IS_LE: os.endianness() === "LE",
    IS_MAC: os.platform() === "darwin",
    IS_WIN: os.platform() === "win32",
  };
}
