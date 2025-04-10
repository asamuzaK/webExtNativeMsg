/* eslint-disable no-template-curly-in-string */
/* api */
import { strict as assert } from 'node:assert';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { IS_WIN } from '../modules/constant.js';

/* test */
import {
  ChildProcess, CmdArgs, concatArray, correctArg, extractArg, stringifyArg
} from '../modules/child-process.js';

/* constants */
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;

describe('concatArray', () => {
  it('should throw', () => {
    assert.throws(() => concatArray(),
      TypeError, 'Expected Array but got Undefined.');
  });

  it('should throw', () => {
    assert.throws(() => concatArray([]),
      TypeError, 'Expected Array but got Undefined.');
  });

  it('should get empty array', () => {
    const res = concatArray([], []);
    assert.deepEqual(res, []);
  });

  it('should get array', () => {
    const res = concatArray(['foo'], []);
    assert.deepEqual(res, ['foo']);
  });

  it('should get array', () => {
    const res = concatArray([], ['foo']);
    assert.deepEqual(res, ['foo']);
  });

  it('should get array', () => {
    const res = concatArray(['foo'], ['bar']);
    assert.deepEqual(res, ['foo', 'bar']);
  });
});

describe('correctArg', () => {
  it('should throw', () => {
    assert.throws(() => correctArg(),
      TypeError, 'Expected String but got Undefined.');
  });

  it('should get string', () => {
    const res = correctArg('-a -b');
    assert.strictEqual(res, '-a -b');
  });

  it('should trim and/or strip quotes', () => {
    const res = correctArg(' "test" ');
    assert.strictEqual(res, 'test');
  });

  it('should strip back slash', () => {
    const res = correctArg('te\\st');
    assert.strictEqual(res, 'test');
  });

  it('should strip quotes', () => {
    const res = correctArg('test "foo bar"');
    assert.strictEqual(res, 'test foo bar');
  });

  it('should strip quotes', () => {
    const res = correctArg('"a\\\\b"');
    assert.strictEqual(res, 'a\\b');
  });

  it('should strip quotes', () => {
    const res = correctArg("'a b'");
    assert.strictEqual(res, 'a b');
  });

  it('should strip quotes', () => {
    const res = correctArg("test 'a b'");
    assert.strictEqual(res, 'test a b');
  });

  it('should strip quotes', () => {
    const res = correctArg('test="a b"');
    assert.strictEqual(res, 'test=a b');
  });

  it('should strip quotes', () => {
    const res = correctArg("test='a b'");
    assert.strictEqual(res, 'test=a b');
  });

  it('should strip quotes', () => {
    const res = correctArg('"--b="c d\\e""');
    assert.strictEqual(res, '--b="c d\\e"');
  });
});

describe('extractArg', () => {
  it('should throw', () => {
    assert.throws(() => extractArg(),
      TypeError, 'Expected String but got Undefined.');
  });

  it('should get empty array', () => {
    const res = extractArg('');
    assert.deepEqual(res, []);
  });

  it('should get empty array', () => {
    const res = extractArg(' ');
    assert.deepEqual(res, []);
  });

  it('should get array', () => {
    const res = extractArg('foo "bar baz"');
    assert.deepEqual(res, [
      'foo',
      'bar baz'
    ]);
  });

  it('should get array', () => {
    const res = extractArg("foo 'bar baz'");
    assert.deepEqual(res, [
      'foo',
      'bar baz'
    ]);
  });

  it('should get array', () => {
    const res = extractArg('foo bar\\baz');
    assert.deepEqual(res, [
      'foo',
      'bar\\baz'
    ]);
  });
});

describe('stringifyArg', () => {
  it('should get empty string if no argument given', () => {
    assert.strictEqual(stringifyArg(), '');
  });

  it('should get empty string if argument is not string', () => {
    assert.strictEqual(stringifyArg(1), '');
  });

  it('should get empty string', () => {
    assert.strictEqual(stringifyArg(''), '');
  });

  it('should get quoted string', () => {
    assert.strictEqual(stringifyArg("''"), "\"''\"");
  });

  it('should get quoted string', () => {
    assert.strictEqual(stringifyArg('""'), '"\\"\\""');
  });

  it('should get string', () => {
    assert.strictEqual(stringifyArg('foo "bar baz" qux\\quux'),
      '"foo \\"bar baz\\" qux\\\\quux"');
  });
});

/* CmdArgs */
describe('CmdArgs', () => {
  const cmd = new CmdArgs();
  const cmdEmptyStr = new CmdArgs('');
  const cmdEmptyArr = new CmdArgs([]);
  const cmdSpace = new CmdArgs(' ');
  const cmdStr = new CmdArgs('-a -b "c d"');
  const cmdArr = new CmdArgs(['-a', '-b', 'c d']);
  const cmdQuoteStr = new CmdArgs('-a --b="c d\\e"');
  const cmdQuoteStr2 = new CmdArgs('-a "--b="c d\\e""');
  const cmdQuoteArr = new CmdArgs(['-a', '--b="c d\\e"']);
  const cmdPlaceholderStr = new CmdArgs('-a ${foo} -b');
  const cmdPlaceholderArr = new CmdArgs(['-a', '${foo}', '-b']);

  it('should create an instance', () => {
    assert.strictEqual(cmd instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdEmptyStr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdEmptyArr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdSpace instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdStr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdArr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdQuoteStr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdQuoteArr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdPlaceholderStr instanceof CmdArgs, true);
  });

  it('should create an instance', () => {
    assert.strictEqual(cmdPlaceholderArr instanceof CmdArgs, true);
  });

  /* methods */
  describe('toArray', () => {
    it('should get empty array', () => {
      assert.deepEqual(cmd.toArray(), []);
    });

    it('should get empty array', () => {
      assert.deepEqual(cmdEmptyStr.toArray(), []);
    });

    it('should get empty array', () => {
      assert.deepEqual(cmdEmptyArr.toArray(), []);
    });

    it('should get empty array', () => {
      assert.deepEqual(cmdSpace.toArray(), []);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdStr.toArray(), ['-a', '-b', 'c d']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdArr.toArray(), ['-a', '-b', 'c d']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdQuoteStr.toArray(), ['-a', '--b=c d\\e']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdQuoteStr2.toArray(), ['-a', '--b="c d\\e"']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdQuoteArr.toArray(), ['-a', '--b="c d\\e"']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdPlaceholderStr.toArray(), ['-a', '${foo}', '-b']);
    });

    it('should get arguments in array', () => {
      assert.deepEqual(cmdPlaceholderArr.toArray(), ['-a', '${foo}', '-b']);
    });
  });

  describe('toString', () => {
    it('should get empty string', () => {
      assert.strictEqual(cmd.toString(), '');
    });

    it('should get empty string', () => {
      assert.strictEqual(cmdEmptyStr.toString(), '');
    });

    it('should get empty string', () => {
      assert.strictEqual(cmdEmptyArr.toString(), '');
    });

    it('should get empty string', () => {
      assert.strictEqual(cmdSpace.toString(), '');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdStr.toString(), '-a -b "c d"');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdArr.toString(), '-a -b "c d"');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdQuoteStr.toString(), '-a "--b=c d\\\\e"');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdQuoteArr.toString(), '-a "--b=\\"c d\\\\e\\""');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdPlaceholderStr.toString(), '-a ${foo} -b');
    });

    it('should get arguments in string', () => {
      assert.strictEqual(cmdPlaceholderArr.toString(), '-a ${foo} -b');
    });
  });
});

/* ChildProcess */
describe('ChildProcess', () => {
  /* constructor */
  it('should create an instance', () => {
    const proc = new ChildProcess();
    assert.strictEqual(proc instanceof ChildProcess, true);
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
        assert.deepStrictEqual(e, new Error('null is not executable.'));
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
      assert.strictEqual(calledOnce, true);
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
      assert.strictEqual(calledOnce, true);
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
      assert.strictEqual(calledOnce, true);
    });

    it('should spawn with file path as last argument', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      const arg = ['-a', '--b="c d\\e"'];
      const file = path.resolve(path.join('test', 'file', 'test.txt'));
      await fs.chmodSync(app, PERM_EXEC);
      await fs.chmodSync(file, PERM_FILE);
      const stub = sinon.stub(childProcess, 'spawn').callsFake((...args) => {
        const [, cmdArgs] = args;
        const [arg1, arg2, arg3] = cmdArgs;
        assert.strictEqual(cmdArgs.length, 3);
        assert.strictEqual(arg1, '-a');
        assert.strictEqual(arg2, '--b="c d\\e"');
        assert.strictEqual(arg3, file);
      });
      await new ChildProcess(app, arg).spawn(file);
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(calledOnce, true);
    });

    it('should spawn with file path as last argument', async () => {
      const app = path.resolve(IS_WIN
        ? path.join('test', 'file', 'test.cmd')
        : path.join('test', 'file', 'test.sh'));
      const arg = '-a --b="c d\\e"';
      const file = path.resolve(path.join('test', 'file', 'test.txt'));
      await fs.chmodSync(app, PERM_EXEC);
      await fs.chmodSync(file, PERM_FILE);
      const stub = sinon.stub(childProcess, 'spawn').callsFake((...args) => {
        const [, cmdArgs] = args;
        const [arg1, arg2, arg3] = cmdArgs;
        assert.strictEqual(cmdArgs.length, 3);
        assert.strictEqual(arg1, '-a');
        assert.strictEqual(arg2, '--b=c d\\e');
        assert.strictEqual(arg3, file);
      });
      await new ChildProcess(app, arg).spawn(file);
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(calledOnce, true);
    });
  });
});
