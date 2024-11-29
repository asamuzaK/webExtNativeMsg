/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import {
  ChildProcess, CmdArgs, Input, Output, Setup,
  convertUriToFilePath, createDirectory, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir, isExecutable,
  isFile, isSubDir, readFile, removeDirSync, removeDirectory
} from '../index.js';

/* Classes */
describe('Classes', () => {
  it('should be instance of ChildProcess', () => {
    const childProcess = new ChildProcess();
    assert.strictEqual(childProcess instanceof ChildProcess, true);
  });

  it('should be instance of CmdArgs', () => {
    const cmdArgs = new CmdArgs();
    assert.strictEqual(cmdArgs instanceof CmdArgs, true);
  });

  it('should be instance of Input', () => {
    const input = new Input();
    assert.strictEqual(input instanceof Input, true);
  });

  it('should be instance of Output', () => {
    const output = new Output();
    assert.strictEqual(output instanceof Output, true);
  });

  it('should be instance of Setup', () => {
    const setup = new Setup();
    assert.strictEqual(setup instanceof Setup, true);
  });
});

/* Functions */
describe('Functions', () => {
  it('should be type of function', () => {
    assert.strictEqual(typeof convertUriToFilePath, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof createDirectory, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof createFile, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof getAbsPath, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof getFileNameFromFilePath, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof getFileTimestamp, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof getStat, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof isDir, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof isExecutable, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof isFile, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof isSubDir, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof readFile, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof removeDirSync, 'function');
  });

  it('should be type of function', () => {
    assert.strictEqual(typeof removeDirectory, 'function');
  });
});
