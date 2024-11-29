/* api */
import { strict as assert } from 'node:assert';
import fs, { promises as fsPromise } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { IS_WIN } from '../modules/constant.js';

/* test */
import {
  convertUriToFilePath, createDirectory, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir, isExecutable,
  isFile, isSubDir, removeDirSync, removeDirectory, readFile
} from '../modules/file-util.js';

/* constants */
const DIR_CWD = process.cwd();
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe('convertUriToFilePath', () => {
  it('should get string', () => {
    const p = path.resolve('foo/bar');
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, 'g');
      u = new URL(`file:///${p.replace(reg, '/')}`).href;
    } else {
      u = new URL(`file://${p}`).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it('should get string', () => {
    const p = path.resolve('foo/bar baz');
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, 'g');
      u = new URL(`file:///${p.replace(reg, '/')}`).href;
    } else {
      u = new URL(`file://${p}`).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it('should get string', () => {
    const p = path.resolve('/foo/bar/baz');
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, 'g');
      u = new URL(`file:///${p.replace(reg, '/')}`).href;
    } else {
      u = new URL(`file://${p}`).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it('should get string', () => {
    const p = path.resolve('/foo/bar/baz');
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, 'g');
      u = new URL(`file://localhost/${p.replace(reg, '/')}`).href;
    } else {
      u = new URL(`file://localhost${p}`).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it('should throw if string is not given', () => {
    assert.throws(() => convertUriToFilePath(), TypeError,
      'Expected String but got Undefined');
  });

  it('should get null if protocol does not match', () => {
    const uri = 'http://example.com';
    assert.deepEqual(convertUriToFilePath(uri), null);
  });
});

describe('createDirectory', () => {
  const dirPath = path.join(TMPDIR, 'webextnativemsg');
  beforeEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });
  afterEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });

  it('should get string', async () => {
    const dirString = path.join(TMPDIR, 'webextnativemsg', '1');
    const dir = await createDirectory(dirString);
    assert.strictEqual(dir, dirString);
    await fsPromise.rm(path.join(TMPDIR, 'webextnativemsg'), {
      force: true,
      recursive: true
    });
  });

  it('should throw if given argument is not a string', async () => {
    await createDirectory().catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should throw if given second argument is not a number', async () => {
    await createDirectory('/foo/bar', 'baz').catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected Number but got String.'));
    });
  });
});

describe('createFile', () => {
  const dirPath = path.join(TMPDIR, 'webextnativemsg');
  beforeEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });
  afterEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });

  it('should get string', async () => {
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'test.txt');
    const value = 'test file.\n';
    const file = await createFile(filePath, value, {
      encoding: 'utf8', flag: 'w', mode: PERM_FILE
    });
    assert.strictEqual(file, filePath);
  });

  it('should throw if first argument is not a string', () => {
    createFile().catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it(
    'should throw if second argument is not string, buffer, uint8array',
    () => {
      const file = path.join(TMPDIR, 'webextnativemsg', 'test.txt');
      createFile(file).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String, Buffer, Uint8Array but got Undefined.'));
      });
    }
  );
});

describe('removeDirSync', () => {
  const dirPath = path.join(TMPDIR, 'webextnativemsg');
  beforeEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });
  afterEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });

  it("should remove dir and it's files", async () => {
    fs.mkdirSync(dirPath);
    const subDirPath = path.join(dirPath, 'foo');
    fs.mkdirSync(subDirPath);
    const filePath = path.join(subDirPath, 'test.txt');
    const value = 'test file.\n';
    await createFile(filePath, value, {
      encoding: 'utf8', flag: 'w', mode: PERM_FILE
    });
    const res1 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    await removeDirSync(dirPath, TMPDIR);
    const res2 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    assert.deepEqual(res1, [true, true, true]);
    assert.deepEqual(res2, [false, false, false]);
  });

  it('should ignore if dir is not a directory', () => {
    const foo = path.resolve('foo');
    assert.strictEqual(isDir(foo), false);
    assert.doesNotThrow(() => removeDirSync(foo, TMPDIR));
  });

  it('should throw if dir is not subdirectory of base dir', async () => {
    const foo = path.join(TMPDIR, 'foo');
    await fs.mkdirSync(dirPath);
    await fs.mkdirSync(foo);
    assert.throws(() => removeDirSync(foo, dirPath), Error,
                  `${foo} is not a subdirectory of ${dirPath}.`);
    await fsPromise.rm(dirPath, {
      force: true,
      recursive: true
    });
    await fsPromise.rm(foo, {
      force: true,
      recursive: true
    });
  });
});

describe('removeDirectory', () => {
  const dirPath = path.join(TMPDIR, 'webextnativemsg');
  beforeEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });
  afterEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true
    });
  });

  it("should remove dir and it's files", async () => {
    fs.mkdirSync(dirPath);
    const subDirPath = path.join(dirPath, 'foo');
    fs.mkdirSync(subDirPath);
    const filePath = path.join(subDirPath, 'test.txt');
    const value = 'test file.\n';
    await createFile(filePath, value, {
      encoding: 'utf8', flag: 'w', mode: PERM_FILE
    });
    const res1 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    await removeDirectory(dirPath, TMPDIR);
    const res2 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    assert.deepEqual(res1, [true, true, true]);
    assert.deepEqual(res2, [false, false, false]);
  });

  it('should ignore if dir is not a directory', async () => {
    const foo = path.resolve('foo');
    assert.strictEqual(isDir(foo), false);
    await removeDirectory(foo, TMPDIR).catch(e => {
      assert.strictEqual(e, undefined);
    });
  });

  it('should throw if dir is not subdirectory of base dir', async () => {
    const foo = path.join(TMPDIR, 'foo');
    await fs.mkdirSync(dirPath);
    await fs.mkdirSync(foo);
    await removeDirectory(foo, dirPath).catch(e => {
      assert.deepStrictEqual(e,
        new Error(`${foo} is not a subdirectory of ${dirPath}.`));
    });
    await fsPromise.rm(dirPath, {
      force: true,
      recursive: true
    });
    await fsPromise.rm(foo, {
      force: true,
      recursive: true
    });
  });
});

describe('getAbsPath', () => {
  it('should get string', () => {
    const p = 'test.txt';
    const n = path.resolve(DIR_CWD, p);
    assert.strictEqual(getAbsPath(p), n);
  });

  it('should get string', () => {
    const p = '~/test.txt';
    const n = path.resolve(DIR_CWD, '~/test.txt');
    assert.strictEqual(getAbsPath(p), n);
  });

  it('should get string', () => {
    const p = 'bar/../foo/test.txt';
    const n = path.resolve(DIR_CWD, 'foo/test.txt');
    assert.strictEqual(getAbsPath(p), n);
  });

  it('should throw', () => {
    assert.throws(() => getAbsPath(), TypeError,
      'Expected String but got Undefined');
  });
});

describe('getFileNameFromFilePath', () => {
  it('should get string', () => {
    const p = path.resolve(path.join('test', 'file', 'test.sh'));
    assert.strictEqual(getFileNameFromFilePath(p), 'test');
  });

  it('should get string', () => {
    const p = path.resolve(path.join('test', 'file', 'test-no-ext'));
    assert.strictEqual(getFileNameFromFilePath(p), 'test-no-ext');
  });

  it('should get default string', () => {
    const p = path.resolve(path.join('test', 'file', '.dotfile'));
    assert.strictEqual(getFileNameFromFilePath(p), 'index');
  });

  it('should get default string', () => {
    const p = path.resolve(path.join('test', 'file'));
    assert.strictEqual(getFileNameFromFilePath(p), 'index');
  });
});

describe('getFileTimestamp', () => {
  it('should get positive integer', () => {
    const p = path.resolve(path.join('test', 'file', 'test.sh'));
    assert.strictEqual(getFileTimestamp(p) > 0, true);
  });

  it('should get 0 if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.strictEqual(getFileTimestamp(p), 0);
  });
});

describe('getStat', () => {
  it('should be an object', () => {
    const p = path.resolve(path.join('test', 'file', 'test.sh'));
    assert.strictEqual(typeof getStat(p), 'object');
  });

  it('should get null if given argument is not string', () => {
    assert.deepEqual(getStat(), null);
  });

  it('should get null if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.deepEqual(getStat(p), null);
  });
});

describe('isDir', () => {
  it('should get true if dir exists', () => {
    const p = path.resolve(path.join('test', 'file'));
    assert.strictEqual(isDir(p), true);
  });

  it('should get false if dir does not exist', () => {
    const p = path.resolve(path.join('test', 'foo'));
    assert.strictEqual(isDir(p), false);
  });
});

describe('isExecutable', () => {
  it('should get true if file is executable', () => {
    const p = path.resolve(IS_WIN
      ? path.join('test', 'file', 'test.cmd')
      : path.join('test', 'file', 'test.sh'));
    fs.chmodSync(p, PERM_EXEC);
    assert.strictEqual(isExecutable(p), true);
  });

  it('should get false if file is not executable', () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    assert.strictEqual(isExecutable(p), false);
  });

  it('should get false if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.strictEqual(isExecutable(p), false);
  });
});

describe('isFile', () => {
  it('should get true if file exists', () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    assert.strictEqual(isFile(p), true);
  });

  it('should get false if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.strictEqual(isFile(p), false);
  });
});

describe('isSubDir', () => {
  it('should get true if dir is subdirectory of base dir', () => {
    const d = path.resolve(path.join('test', 'file'));
    const b = path.resolve('test');
    assert.strictEqual(isSubDir(d, b), true);
  });

  it('should get false if dir is not subdirectory of base dir', () => {
    const d = path.resolve('foo');
    const b = path.resolve('test');
    assert.strictEqual(isSubDir(d, b), false);
  });
});

describe('readFile', () => {
  it('should throw', async () => {
    await readFile('foo/bar').catch(e => {
      assert.deepStrictEqual(e, new Error('foo/bar is not a file.'));
    });
  });

  it('should get file', async () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    const opt = { encoding: 'utf8', flag: 'r' };
    const file = await readFile(p, opt);
    assert.strictEqual(file, 'test file\n');
  });
});
