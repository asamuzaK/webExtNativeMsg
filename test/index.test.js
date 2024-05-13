/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import {
  ChildProcess, Input, Output, Setup,
  convertUriToFilePath, createDirectory, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir, isExecutable,
  isFile, isSubDir, readFile, removeDir
} from '../index.js';

/* Classes */
describe('Classes', () => {
  it('should be instance of ChildProcess', () => {
    const childProcess = new ChildProcess();
    assert.instanceOf(childProcess, ChildProcess);
  });

  it('should be instance of Input', () => {
    const input = new Input();
    assert.instanceOf(input, Input);
  });

  it('should be instance of Output', () => {
    const output = new Output();
    assert.instanceOf(output, Output);
  });

  it('should be instance of Setup', () => {
    const setup = new Setup();
    assert.instanceOf(setup, Setup);
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
    assert.strictEqual(typeof removeDir, 'function');
  });
});
