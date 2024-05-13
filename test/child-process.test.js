/* api */
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { IS_WIN } from '../modules/constant.js';

/* test */
import { ChildProcess } from '../modules/child-process.js';

/* constants */
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;

/* ChildProcess */
describe('ChildProcess', () => {
  /* constructor */
  it('should create an instance', () => {
    const proc = new ChildProcess();
    assert.instanceOf(proc, ChildProcess);
  });

  /* get spawn args */
  it('should set cmd', () => {
    const app = IS_WIN ? 'test.cmd' : 'test.sh';
    const cmd = path.resolve(path.join('test', 'file', app));
    const proc = new ChildProcess(cmd);
    const [res] = proc._getSpawnArgs();
    assert.strictEqual(res, cmd);
  });

  it('should set args', () => {
    const args = ['foo', 'bar'];
    const proc = new ChildProcess(null, args);
    const [, res] = proc._getSpawnArgs();
    assert.deepEqual(res, args);
  });

  it('should set args', () => {
    const args = 'foo bar';
    const proc = new ChildProcess(null, args);
    const [, res] = proc._getSpawnArgs();
    assert.deepEqual(res, args.split(' '));
  });

  it('should set option', () => {
    const opt = { cwd: null, env: process.env, encoding: 'utf8' };
    const proc = new ChildProcess(null, null, opt);
    const [,, res] = proc._getSpawnArgs();
    assert.deepEqual(res, opt);
  });

  /* method */
  describe('spawn', () => {
    it('should throw if given command is not executable', async () => {
      await new ChildProcess().spawn().catch(e => {
        assert.strictEqual(e.message, 'null is not executable.');
      });
    });

    it('should spawn child process', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      await fs.chmodSync(app, PERM_EXEC);
      const proc = await new ChildProcess(app).spawn();
      proc.on('close', code => {
        assert.strictEqual(code, 0);
      });
    });

    it('should spawn child process', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test 2.cmd')
        : path.join('test', 'file', 'test 2.sh'));
      await fs.chmodSync(app, PERM_EXEC);
      const proc = await new ChildProcess(app).spawn();
      proc.on('close', code => {
        assert.strictEqual(code, 0);
      });
    });

    it('should spawn with file path as first argument', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      const file = path.resolve(path.join('test', 'file', 'test.txt'));
      await fs.chmodSync(app, PERM_EXEC);
      await fs.chmodSync(file, PERM_FILE);
      const stub = sinon.stub(childProcess, 'spawn').callsFake((...args) => {
        const [, cmdArgs] = args;
        const [filePath] = cmdArgs;
        assert.strictEqual(cmdArgs.length, 1);
        assert.strictEqual(filePath, file);
      });
      await new ChildProcess(app).spawn(file);
      const { calledOnce } = stub;
      stub.restore();
      assert.isTrue(calledOnce);
    });

    it('should spawn with file path as first argument', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      const file = path.resolve(path.join('test', 'file', 'test.txt'));
      await fs.chmodSync(app, PERM_EXEC);
      await fs.chmodSync(file, PERM_FILE);
      const stub = sinon.stub(childProcess, 'spawn').callsFake((...args) => {
        const [, cmdArgs] = args;
        const [filePath] = cmdArgs;
        assert.strictEqual(cmdArgs.length, 1);
        assert.strictEqual(filePath, file);
      });
      await new ChildProcess(app).spawn(file, true);
      const { calledOnce } = stub;
      stub.restore();
      assert.isTrue(calledOnce);
    });

    it('should spawn with file path as last argument', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      const arg = ['-a', '-b'];
      const file = path.resolve(path.join('test', 'file', 'test.txt'));
      await fs.chmodSync(app, PERM_EXEC);
      await fs.chmodSync(file, PERM_FILE);
      const stub = sinon.stub(childProcess, 'spawn').callsFake((...args) => {
        const [, cmdArgs] = args;
        const [arg1, arg2, arg3] = cmdArgs;
        assert.strictEqual(cmdArgs.length, 3);
        assert.strictEqual(arg1, '-a');
        assert.strictEqual(arg2, '-b');
        assert.strictEqual(arg3, file);
      });
      await new ChildProcess(app, arg).spawn(file);
      const { calledOnce } = stub;
      stub.restore();
      assert.isTrue(calledOnce);
    });
  });
});
