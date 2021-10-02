/**
 * constants.js
 */

/* api */
import os from 'os';
import path from 'path';

/* constants */
export const CHAR = 'utf8';
export const DIR_CONFIG_LINUX = path.join(os.homedir(), '.config');
export const DIR_CONFIG_MAC =
  path.join(os.homedir(), 'Library', 'Application Support');
export const DIR_CONFIG_WIN = path.join(os.homedir(), 'AppData', 'Roaming');
export const DIR_HOME = os.homedir();
export const EXT_CHROME = 'chromeExtension';
export const EXT_WEB = 'webExtension';
export const INDENT = 2;
export const IS_BE = os.endianness() === 'BE';
export const IS_LE = os.endianness() === 'LE';
export const IS_MAC = os.platform() === 'darwin';
export const IS_WIN = os.platform() === 'win32';
