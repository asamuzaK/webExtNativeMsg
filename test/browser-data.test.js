/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import { browserData } from '../modules/browser-data.js';

describe('browsers', () => {
  it('should contain all keys', () => {
    const keys = [
      'brave',
      'chrome',
      'chromebeta',
      'chromecanary',
      'chromium',
      'edge',
      'firefox',
      'librewolf',
      'opera',
      'thunderbird',
      'vivaldi',
      'waterfoxcurrent'
    ];
    assert.strictEqual(Object.keys(browserData).length, keys.length);
    for (const key of Object.keys(browserData)) {
      assert.strictEqual(keys.includes(key), true);
    }
  });
});

describe('Firefox', () => {
  const browser = 'firefox';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('LibreWolf', () => {
  const browser = 'librewolf';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });

  it('should get null value', () => {
    assert.deepEqual(browserData[browser].hostMac, null);
  });
});

describe('Thunderbird', () => {
  const browser = 'thunderbird';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Waterfox Current', () => {
  const browser = 'waterfoxcurrent';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Chrome', () => {
  const browser = 'chrome';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Chrome Beta', () => {
  const browser = 'chromebeta';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Chrome Canary', () => {
  const browser = 'chromecanary';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });

  it('should get null value', () => {
    assert.deepEqual(browserData[browser].hostLinux, null);
  });
});

describe('Chromium', () => {
  const browser = 'chromium';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });

  it('should get null value', () => {
    assert.deepEqual(browserData[browser].regWin, null);
  });
});

describe('Brave', () => {
  const browser = 'brave';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Edge', () => {
  const browser = 'edge';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should not contain alter alias key', () => {
    assert.strictEqual(browserData[browser].aliasWin, undefined);
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});

describe('Opera', () => {
  const browser = 'opera';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasMac', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });

  it('should get null value', () => {
    assert.deepEqual(browserData[browser].hostLinux, null);
  });
});

describe('Vivaldi', () => {
  const browser = 'vivaldi';

  it('should contain browser', () => {
    assert.strictEqual(typeof browserData[browser], 'object');
  });

  it('should contain alias and type keys', () => {
    const keys = ['alias', 'aliasWin', 'type'];
    for (const key of keys) {
      assert.strictEqual(typeof browserData[browser][key], 'string');
    }
  });

  it('should contain host keys', () => {
    const keys = ['hostLinux', 'hostMac', 'regWin'];
    for (const key of keys) {
      assert.strictEqual(Array.isArray(browserData[browser][key]), true);
    }
  });
});
