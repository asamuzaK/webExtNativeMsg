/* api */
import { strict as assert } from 'node:assert';
import os from 'node:os';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { Input, Output } from '../modules/native-message.js';

/* Input */
describe('Input', () => {
  afterEach(() => {
    sinon.restore();
  });

  /* constructor */
  it('should create an instance', () => {
    const input = new Input();
    assert.strictEqual(input instanceof Input, true);
  });

  /* method */
  describe('decode', () => {
    it('should get null', () => {
      const input = new Input();
      assert.deepEqual(input.decode(), null);
    });

    it('should get null', () => {
      const input = new Input();
      assert.deepEqual(input.decode(Buffer.alloc(0)), null);
    });

    it('should get null', () => {
      const input = new Input();
      assert.deepEqual(input.decode(Buffer.alloc(4)), null);
    });

    it('should decode buffer to array of message (Little Endian)', () => {
      sinon.stub(os, 'endianness').returns('LE');
      const input = new Input();
      assert.deepEqual(
        input.decode(Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])),
        ['test']
      );
    });

    it('should decode buffer to array of message (Big Endian)', () => {
      sinon.stub(os, 'endianness').returns('BE');
      const input = new Input();
      assert.deepEqual(
        input.decode(Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])),
        ['test']
      );
    });

    it('should decode chunked buffer to array of message (Little Endian)', () => {
      sinon.stub(os, 'endianness').returns('LE');
      const input = new Input();
      const msg1 = input.decode(Buffer.from([6, 0, 0, 0]));
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, null);
      assert.deepEqual(msg2, ['test']);
    });

    it('should decode chunked buffer to array of message (Big Endian)', () => {
      sinon.stub(os, 'endianness').returns('BE');
      const input = new Input();
      const msg1 = input.decode(Buffer.from([0, 0, 0, 6]));
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, null);
      assert.deepEqual(msg2, ['test']);
    });

    it('should decode multiple messages (Little Endian)', () => {
      sinon.stub(os, 'endianness').returns('LE');
      const input = new Input();
      const msg1 = input.decode(
        Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34, 6, 0, 0, 0])
      );
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, ['test']);
      assert.deepEqual(msg2, ['test']);
    });

    it('should decode multiple messages (Big Endian)', () => {
      sinon.stub(os, 'endianness').returns('BE');
      const input = new Input();
      const msg1 = input.decode(
        Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34, 0, 0, 0, 6])
      );
      const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
      assert.deepEqual(msg1, ['test']);
      assert.deepEqual(msg2, ['test']);
    });

    it('should decode two complete messages in one chunk (Little Endian)', () => {
      sinon.stub(os, 'endianness').returns('LE');
      const input = new Input();
      const msg = input.decode(Buffer.from([
        6, 0, 0, 0, 34, 116, 101, 115, 116, 34,
        6, 0, 0, 0, 34, 116, 101, 115, 116, 34
      ]));
      assert.deepEqual(msg, ['test', 'test']);
    });

    it('should decode two complete messages in one chunk (Big Endian)', () => {
      sinon.stub(os, 'endianness').returns('BE');
      const input = new Input();
      const msg = input.decode(Buffer.from([
        0, 0, 0, 6, 34, 116, 101, 115, 116, 34,
        0, 0, 0, 6, 34, 116, 101, 115, 116, 34
      ]));
      assert.deepEqual(msg, ['test', 'test']);
    });
  });
});

/* Output */
describe('Output', () => {
  afterEach(() => {
    sinon.restore();
  });

  /* constructor */
  it('should create an instance', () => {
    const output = new Output();
    assert.strictEqual(output instanceof Output, true);
  });

  /* method */
  describe('encode', () => {
    it('should get null', () => {
      const output = new Output();
      assert.deepEqual(output.encode(), null);
    });

    it('should get null for empty string', () => {
      const output = new Output();
      assert.deepEqual(output.encode(''), null);
    });

    it('should get null for function', () => {
      const output = new Output();
      assert.deepEqual(output.encode(a => a), null);
    });

    it('should encode message to buffer (Little Endian)', () => {
      sinon.stub(os, 'endianness').returns('LE');
      const output = new Output();
      assert.deepEqual(
        output.encode('test'),
        Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])
      );
    });

    it('should encode message to buffer (Big Endian)', () => {
      sinon.stub(os, 'endianness').returns('BE');
      const output = new Output();
      assert.deepEqual(
        output.encode('test'),
        Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])
      );
    });
  });
});
