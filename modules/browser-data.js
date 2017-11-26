/**
 * browser-data.js
 */
"use strict";
{
  /* constants */
  const {DIR_CONFIG, DIR_HOME, EXT_CHROME, EXT_WEB} = require("./constant");
  const HKCU_SOFTWARE = ["HKEY_CURRENT_USER", "SOFTWARE"];
  const HOST_DIR_LABEL = "NativeMessagingHosts";

  /* browser config data */
  const browserData = {
    /* gecko */
    firefox: {
      alias: "firefox",
      hostLinux: [DIR_HOME, ".mozilla", "native-messaging-hosts"],
      hostMac: [...DIR_CONFIG, "Mozilla", HOST_DIR_LABEL],
      regWin: [...HKCU_SOFTWARE, "Mozilla", HOST_DIR_LABEL],
      type: EXT_WEB,
    },
    cyberfox: {
      alias: "cyberfox",
      aliasWin: "firefox",
      hostLinux: null,
      hostMac: null,
      regWin: [...HKCU_SOFTWARE, "Mozilla", HOST_DIR_LABEL],
      type: EXT_WEB,
    },
    waterfox: {
      alias: "waterfox",
      aliasWin: "firefox",
      hostLinux: null,
      hostMac: null,
      regWin: [...HKCU_SOFTWARE, "Mozilla", HOST_DIR_LABEL],
      type: EXT_WEB,
    },
    /* blink */
    chrome: {
      alias: "chrome",
      hostLinux: [...DIR_CONFIG, "google-chrome", HOST_DIR_LABEL],
      hostMac: [...DIR_CONFIG, "Google", "Chrome", HOST_DIR_LABEL],
      regWin: [...HKCU_SOFTWARE, "Google", "Chrome", HOST_DIR_LABEL],
      type: EXT_CHROME,
    },
    chromium: {
      alias: "chromium",
      hostLinux: [...DIR_CONFIG, "chromium", HOST_DIR_LABEL],
      hostMac: [...DIR_CONFIG, "Chromium", HOST_DIR_LABEL],
      regWin: null,
      type: EXT_CHROME,
    },
    CentBrowser: {
      alias: "centbrowser",
      aliasWin: "chrome",
      hostLinux: null,
      hostMac: null,
      regWin: [...HKCU_SOFTWARE, "Google", "Chrome", HOST_DIR_LABEL],
      type: EXT_CHROME,
    },
    kinza: {
      alias: "kinza",
      aliasWin: "chrome",
      hostLinux: null,
      hostMac: null,
      regWin: [...HKCU_SOFTWARE, "Google", "Chrome", HOST_DIR_LABEL],
      type: EXT_CHROME,
    },
    opera: {
      alias: "opera",
      aliasMac: "chrome",
      aliasWin: "chrome",
      hostLinux: null,
      hostMac: [...DIR_CONFIG, "Google", "Chrome", HOST_DIR_LABEL],
      regWin: [...HKCU_SOFTWARE, "Google", "Chrome", HOST_DIR_LABEL],
      type: EXT_CHROME,
    },
    vivaldi: {
      alias: "vivaldi",
      aliasWin: "chrome",
      hostLinux: [...DIR_CONFIG, "vivaldi", HOST_DIR_LABEL],
      hostMac: [...DIR_CONFIG, "Vivaldi", HOST_DIR_LABEL],
      regWin: [...HKCU_SOFTWARE, "Google", "Chrome", HOST_DIR_LABEL],
      type: EXT_CHROME,
    },
  };

  module.exports = {
    browserData,
  };
}
