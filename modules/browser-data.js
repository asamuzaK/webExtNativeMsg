/**
 * browser-data.js
 */

/* api */
import {
  DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_HOME, EXT_CHROME, EXT_WEB
} from './constant.js';

/* constants */
const HKCU_SOFTWARE = ['HKEY_CURRENT_USER', 'SOFTWARE'];
const HOST = 'native-messaging-hosts';
const HOST_CAMEL = 'NativeMessagingHosts';

/* browser config data */
export const browserData = {
  /* gecko */
  firefox: {
    alias: 'firefox',
    hostLinux: [DIR_HOME, '.mozilla', HOST],
    hostMac: [DIR_CONFIG_MAC, 'Mozilla', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Mozilla', HOST_CAMEL],
    type: EXT_WEB
  },
  thunderbird: {
    alias: 'thunderbird',
    hostLinux: [DIR_HOME, '.thunderbird', HOST],
    hostMac: [DIR_CONFIG_MAC, 'Thunderbird', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Thunderbird', HOST_CAMEL],
    type: EXT_WEB
  },
  waterfoxcurrent: {
    alias: 'waterfoxcurrent',
    hostLinux: [DIR_HOME, '.waterfox', HOST],
    hostMac: [DIR_CONFIG_MAC, 'Waterfox', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Waterfox', HOST_CAMEL],
    type: EXT_WEB
  },
  librewolf: {
    alias: 'librewolf',
    aliasWin: 'firefox',
    hostLinux: [DIR_HOME, '.librewolf', HOST],
    hostMac: null,
    regWin: [...HKCU_SOFTWARE, 'Mozilla', HOST_CAMEL],
    type: EXT_WEB
  },
  /* blink */
  chrome: {
    alias: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'google-chrome', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  },
  chromebeta: {
    alias: 'chromebeta',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'google-chrome-beta', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome Beta', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  },
  chromecanary: {
    alias: 'chromecanary',
    aliasWin: 'chrome',
    hostLinux: null,
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome Canary', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  },
  chromium: {
    alias: 'chromium',
    hostLinux: [DIR_CONFIG_LINUX, 'chromium', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'Chromium', HOST_CAMEL],
    regWin: null,
    type: EXT_CHROME
  },
  brave: {
    alias: 'brave',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'BraveSoftware', 'Brave-Browser', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'BraveSoftware', 'Brave-Browser', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  },
  edge: {
    alias: 'edge',
    hostLinux: [DIR_CONFIG_LINUX, 'microsoft-edge', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'Microsoft Edge', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Microsoft', 'Edge', HOST_CAMEL],
    type: EXT_CHROME
  },
  opera: {
    alias: 'opera',
    aliasMac: 'chrome',
    aliasWin: 'chrome',
    hostLinux: null,
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  },
  vivaldi: {
    alias: 'vivaldi',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'vivaldi', HOST_CAMEL],
    hostMac: [DIR_CONFIG_MAC, 'Vivaldi', HOST_CAMEL],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', HOST_CAMEL],
    type: EXT_CHROME
  }
};
