/* eslint-disable no-template-curly-in-string */
'use strict';
/* api */
const {
  ChildProcess, CmdArgs, concatArray, correctArg, extractArg, stringifyArg
} = require('../modules/child-process');
const { assert } = require('chai');
const { describe, it } = require('mocha');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');
const sinon = require('sinon');

/* constants */
const { IS_WIN } = require('../modules/constant');
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
    assert.instanceOf(cmd, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdEmptyStr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdEmptyArr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdSpace, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdStr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdArr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdQuoteStr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdQuoteArr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdPlaceholderStr, CmdArgs);
  });

  it('should create an instance', () => {
    assert.instanceOf(cmdPlaceholderArr, CmdArgs);
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
  it('should create an instance', () => {
    const proc = new ChildProcess();
    assert.instanceOf(proc, ChildProcess);
  });

  /* constructor */
  it('should set cmd', () => {
    const app = IS_WIN ? 'test.cmd' : 'test.sh';
    const cmd = path.resolve(path.join('test', 'file', app));
    const proc = new ChildProcess(cmd);
    assert.deepEqual(proc._cmd, cmd);
  });

  it('should set args', () => {
    const args = ['foo', 'bar'];
    const proc = new ChildProcess(null, args);
    assert.deepEqual(proc._args, args);
  });

  it('should set args', () => {
    const args = 'foo bar';
    const proc = new ChildProcess(null, args);
    assert.deepEqual(proc._args, args.split(' '));
  });

  it('should set option', () => {
    const opt = { cwd: null, env: process.env, encoding: 'utf8' };
    const proc = new ChildProcess(null, null, opt);
    assert.deepEqual(proc._opt, opt);
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
