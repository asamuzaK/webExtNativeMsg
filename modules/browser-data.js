/**
 * browser-data.js
 */

/* api */
import {
  DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_HOME, EXT_CHROME, EXT_WEB
} from './constant.js';

/* constants */
const HKCU_SOFTWARE = ['HKEY_CURRENT_USER', 'SOFTWARE'];
const NM_HOSTS = 'NativeMessagingHosts';

/* browser config data */
export const browserData = {
  /* gecko */
  firefox: {
    alias: 'firefox',
    hostLinux: [DIR_HOME, '.mozilla', 'native-messaging-hosts'],
    hostMac: [DIR_CONFIG_MAC, 'Mozilla', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Mozilla', NM_HOSTS],
    type: EXT_WEB
  },
  thunderbird: {
    alias: 'thunderbird',
    hostLinux: [DIR_HOME, '.thunderbird', 'native-messaging-hosts'],
    hostMac: [DIR_CONFIG_MAC, 'Thunderbird', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Thunderbird', NM_HOSTS],
    type: EXT_WEB
  },
  waterfoxcurrent: {
    alias: 'waterfoxcurrent',
    hostLinux: [DIR_HOME, '.waterfox', 'native-messaging-hosts'],
    hostMac: [DIR_CONFIG_MAC, 'Waterfox', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Waterfox', NM_HOSTS],
    type: EXT_WEB
  },
  librewolf: {
    alias: 'librewolf',
    aliasWin: 'firefox',
    hostLinux: [DIR_HOME, '.librewolf', 'native-messaging-hosts'],
    hostMac: null,
    regWin: [...HKCU_SOFTWARE, 'Mozilla', NM_HOSTS],
    type: EXT_WEB
  },
  /* blink */
  chrome: {
    alias: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'google-chrome', NM_HOSTS],
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  },
  chromebeta: {
    alias: 'chromebeta',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'google-chrome-beta', NM_HOSTS],
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome Beta', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  },
  chromecanary: {
    alias: 'chromecanary',
    aliasWin: 'chrome',
    hostLinux: null,
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome Canary', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  },
  chromium: {
    alias: 'chromium',
    hostLinux: [DIR_CONFIG_LINUX, 'chromium', NM_HOSTS],
    hostMac: [DIR_CONFIG_MAC, 'Chromium', NM_HOSTS],
    regWin: null,
    type: EXT_CHROME
  },
  brave: {
    alias: 'brave',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'BraveSoftware', 'Brave-Browser', NM_HOSTS],
    hostMac: [DIR_CONFIG_MAC, 'BraveSoftware', 'Brave-Browser', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  },
  edge: {
    alias: 'edge',
    hostLinux: null,
    hostMac: [DIR_CONFIG_MAC, 'Microsoft Edge', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Microsoft', 'Edge', NM_HOSTS],
    type: EXT_CHROME
  },
  opera: {
    alias: 'opera',
    aliasMac: 'chrome',
    aliasWin: 'chrome',
    hostLinux: null,
    hostMac: [DIR_CONFIG_MAC, 'Google', 'Chrome', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  },
  vivaldi: {
    alias: 'vivaldi',
    aliasWin: 'chrome',
    hostLinux: [DIR_CONFIG_LINUX, 'vivaldi', NM_HOSTS],
    hostMac: [DIR_CONFIG_MAC, 'Vivaldi', NM_HOSTS],
    regWin: [...HKCU_SOFTWARE, 'Google', 'Chrome', NM_HOSTS],
    type: EXT_CHROME
  }
};
