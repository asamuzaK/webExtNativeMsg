/* api */
import { strict as assert } from 'node:assert';
import sinon from 'sinon';
import { describe, it } from 'mocha';

/* test */
import {
  escapeChar, getType, isString, logErr, logMsg, logWarn, quoteArg, throwErr
} from '../modules/common.js';

describe('escapeChar', () => {
  it('should get escaped string', () => {
    const c = 'abc';
    const re = /(b)/gi;
    assert.strictEqual(escapeChar(c, re), 'a\\bc');
  });

  it('should get null if string is not given', () => {
    const re = /(b)/gi;
    assert.deepEqual(escapeChar(1, re), null);
  });

  it('should get null if regexp is not given', () => {
    const c = 'abc';
    assert.deepEqual(escapeChar(c), null);
  });
});

describe('getType', () => {
  it('should get Undefined', () => {
    assert.strictEqual(getType(), 'Undefined');
  });

  it('should get Null', () => {
    assert.strictEqual(getType(null), 'Null');
  });

  it('should get Object', () => {
    assert.strictEqual(getType({}), 'Object');
  });

  it('should get Array', () => {
    assert.strictEqual(getType([]), 'Array');
  });

  it('should get Boolean', () => {
    assert.strictEqual(getType(true), 'Boolean');
  });

  it('should get Number', () => {
    assert.strictEqual(getType(1), 'Number');
  });

  it('should get String', () => {
    assert.strictEqual(getType('a'), 'String');
  });
});

describe('isString', () => {
  it('should get true if string is given', () => {
    assert.strictEqual(isString('a'), true);
  });

  it('should get false if given argument is not string', () => {
    assert.strictEqual(isString(1), false);
  });
});

describe('logErr', () => {
  it('should get false', () => {
    const msg = 'Log Error test';
    let errMsg;
    const consoleError = sinon.stub(console, 'error').callsFake(e => {
      errMsg = e.message;
    });
    const res = logErr(new Error(msg));
    const { calledOnce } = consoleError;
    consoleError.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(errMsg, msg);
    assert.strictEqual(res, false);
  });
});

describe('logMsg', () => {
  it('should get string', () => {
    const msg = 'Log message test';
    let logMessage;
    const consoleLog = sinon.stub(console, 'log').callsFake(m => {
      logMessage = m;
    });
    const res = logMsg(msg);
    const { calledOnce } = consoleLog;
    consoleLog.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(logMessage, msg);
    assert.strictEqual(res, msg);
  });
});

describe('logWarn', () => {
  it('should get false', () => {
    const msg = 'Log warn test';
    let warnMsg;
    const consoleWarn = sinon.stub(console, 'warn').callsFake(m => {
      warnMsg = m;
    });
    const res = logWarn(msg);
    const { calledOnce } = consoleWarn;
    consoleWarn.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(warnMsg, msg);
    assert.strictEqual(res, false);
  });
});

describe('quoteArg', () => {
  it('should be quoted if arg contains spaces', () => {
    assert.strictEqual(quoteArg('a b'), '"a b"');
  });

  it('should be quoted if arg contains spaces', () => {
    assert.strictEqual(quoteArg('a b "c d"'), '"a b \\"c d\\""');
  });

  it('should not be quoted if arg does not contain any space', () => {
    assert.strictEqual(quoteArg('abc'), 'abc');
  });
});

describe('throwErr', () => {
  it('should throw', () => {
    const e = new Error('Error');
    assert.throws(() => throwErr(e));
  });
});
