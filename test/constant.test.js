/* api */
import { strict as assert } from 'node:assert';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { isString } from '../modules/common.js';

/* test */
import {
  CHAR, DIR_CONFIG_LINUX, DIR_CONFIG_MAC, DIR_CONFIG_WIN, DIR_HOME,
  EXT_CHROME, EXT_WEB, INDENT, IS_MAC, IS_WIN
} from '../modules/constant.js';

describe('string constants', () => {
  it('should get string', () => {
    const arr = [
      CHAR,
      DIR_CONFIG_LINUX,
      DIR_CONFIG_MAC,
      DIR_CONFIG_WIN,
      DIR_HOME,
      EXT_CHROME,
      EXT_WEB
    ];
    arr.forEach(i => {
      assert.strictEqual(isString(i), true);
    });
  });
});

describe('number constants', () => {
  it('should get number', () => {
    const arr = [INDENT];
    arr.forEach(i => {
      assert.strictEqual(typeof i, 'number');
    });
  });
});

describe('boolean constants', () => {
  it('should get boolean', () => {
    const arr = [
      IS_MAC,
      IS_WIN
    ];
    arr.forEach(i => {
      assert.strictEqual(typeof i, 'boolean');
    });
  });
});

describe('DIR_CONFIG_WIN', () => {
  let originalAppData;
  beforeEach(() => {
    originalAppData = process.env.APPDATA;
  });
  afterEach(() => {
    if (originalAppData !== undefined) {
      process.env.APPDATA = originalAppData;
    } else {
      delete process.env.APPDATA;
    }
  });

  it('should evaluate to APPDATA or fallback path (Static Import)', () => {
    const expected =
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    assert.strictEqual(DIR_CONFIG_WIN, expected);
  });

  it('should use fallback path when APPDATA is not set', async () => {
    delete process.env.APPDATA;
    const { DIR_CONFIG_WIN: mockDirWin } =
      await import(`../modules/constant.js?t=${Date.now()}`);
    const fallback = path.join(os.homedir(), 'AppData', 'Roaming');
    assert.strictEqual(mockDirWin, fallback);
  });

  it('should use custom APPDATA when it is set', async () => {
    const customPath = path.join('C:', 'Custom', 'AppData');
    process.env.APPDATA = customPath;
    const { DIR_CONFIG_WIN: mockDirWin } =
      await import(`../modules/constant.js?t=${Date.now() + 1}`);
    assert.strictEqual(mockDirWin, customPath);
  });
});
