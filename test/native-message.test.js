/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';
import { IS_BE } from '../modules/constant.js';

/* test */
import { Input, Output } from '../modules/native-message.js';

/* Input */
describe('Input', () => {
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

    it('should decode buffer to array of message', () => {
      const input = new Input();
      if (IS_BE) {
        assert.deepEqual(
          input.decode(Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])),
          ['test']
        );
      } else {
        assert.deepEqual(
          input.decode(Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])),
          ['test']
        );
      }
    });

    it('should decode buffer to array of message', () => {
      const input = new Input();
      if (IS_BE) {
        const msg1 = input.decode(Buffer.from([0, 0, 0, 6]));
        const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
        assert.deepEqual(msg1, null);
        assert.deepEqual(msg2, ['test']);
      } else {
        const msg1 = input.decode(Buffer.from([6, 0, 0, 0]));
        const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
        assert.deepEqual(msg1, null);
        assert.deepEqual(msg2, ['test']);
      }
    });

    it('should decode buffer to array of message', () => {
      const input = new Input();
      if (IS_BE) {
        const msg1 = input.decode(
          Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34, 0, 0, 0, 6])
        );
        const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
        assert.deepEqual(msg1, ['test']);
        assert.deepEqual(msg2, ['test']);
      } else {
        const msg1 = input.decode(
          Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34, 6, 0, 0, 0])
        );
        const msg2 = input.decode(Buffer.from([34, 116, 101, 115, 116, 34]));
        assert.deepEqual(msg1, ['test']);
        assert.deepEqual(msg2, ['test']);
      }
    });

    it('should decode buffer to array of message', () => {
      const input = new Input();
      if (IS_BE) {
        const msg = input.decode(Buffer.from([
          0, 0, 0, 6, 34, 116, 101, 115, 116, 34,
          0, 0, 0, 6, 34, 116, 101, 115, 116, 34
        ]));
        assert.deepEqual(msg, ['test', 'test']);
      } else {
        const msg = input.decode(Buffer.from([
          6, 0, 0, 0, 34, 116, 101, 115, 116, 34,
          6, 0, 0, 0, 34, 116, 101, 115, 116, 34
        ]));
        assert.deepEqual(msg, ['test', 'test']);
      }
    });
  });
});

/* Output */
describe('Output', () => {
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

    it('should get null', () => {
      const output = new Output();
      assert.deepEqual(output.encode(''), null);
    });

    it('should get null', () => {
      const output = new Output();
      assert.deepEqual(output.encode(a => a), null);
    });

    it('should encode message to buffer', () => {
      const output = new Output();
      if (IS_BE) {
        assert.deepEqual(
          output.encode('test'),
          Buffer.from([0, 0, 0, 6, 34, 116, 101, 115, 116, 34])
        );
      } else {
        assert.deepEqual(
          output.encode('test'),
          Buffer.from([6, 0, 0, 0, 34, 116, 101, 115, 116, 34])
        );
      }
    });
  });
});
