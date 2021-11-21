/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import { browserData } from '../modules/browser-data.js';

describe('browsers', () => {
  it('should contain all keys', () => {
    const keys = [
      'brave',
      'centbrowser',
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
    assert.containsAllKeys(browserData, keys);
  });
});

describe('Firefox', () => {
  it('should contain firefox property', () => {
    assert.property(browserData, 'firefox');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.firefox, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.firefox, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.firefox, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.firefox.hostLinux);
    assert.isArray(browserData.firefox.hostMac);
    assert.isArray(browserData.firefox.regWin);
  });
});

describe('LibreWolf', () => {
  it('should contain librewolf property', () => {
    assert.property(browserData, 'librewolf');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.firefox, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.firefox, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.librewolf, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.librewolf.hostLinux);
    assert.isNull(browserData.librewolf.hostMac);
    assert.isArray(browserData.librewolf.regWin);
  });
});

describe('Thunderbird', () => {
  it('should contain thunderbird property', () => {
    assert.property(browserData, 'thunderbird');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.thunderbird, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.thunderbird, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.thunderbird, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.thunderbird.hostLinux);
    assert.isArray(browserData.thunderbird.hostMac);
    assert.isArray(browserData.thunderbird.regWin);
  });
});

describe('Waterfox Current', () => {
  it('should contain waterfoxcurrent property', () => {
    assert.property(browserData, 'waterfoxcurrent');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.waterfoxcurrent, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.waterfoxcurrent, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.waterfoxcurrent, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.waterfoxcurrent.hostLinux);
    assert.isArray(browserData.waterfoxcurrent.hostMac);
    assert.isArray(browserData.waterfoxcurrent.regWin);
  });
});

describe('Chrome', () => {
  it('should contain chrome property', () => {
    assert.property(browserData, 'chrome');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.chrome, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.chrome, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.chrome, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.chrome.hostLinux);
    assert.isArray(browserData.chrome.hostMac);
    assert.isArray(browserData.chrome.regWin);
  });
});

describe('Chrome Beta', () => {
  it('should contain chrome property', () => {
    assert.property(browserData, 'chromebeta');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.chromebeta, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.chromebeta, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.chromebeta, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.chromebeta.hostLinux);
    assert.isArray(browserData.chromebeta.hostMac);
    assert.isArray(browserData.chromebeta.regWin);
  });
});

describe('Chrome Canary', () => {
  it('should contain chromecanary property', () => {
    assert.property(browserData, 'chromecanary');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.chromecanary, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.chromecanary, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.chromecanary, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isNull(browserData.chromecanary.hostLinux);
    assert.isArray(browserData.chromecanary.hostMac);
    assert.isArray(browserData.chromecanary.regWin);
  });
});

describe('Chromium', () => {
  it('should contain chromium property', () => {
    assert.property(browserData, 'chromium');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.chromium, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.chromium, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.chromium, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.chromium.hostLinux);
    assert.isArray(browserData.chromium.hostMac);
    assert.isNull(browserData.chromium.regWin);
  });
});

describe('Brave', () => {
  it('should contain brave property', () => {
    assert.property(browserData, 'brave');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.brave, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.brave, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.brave, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.brave.hostLinux);
    assert.isArray(browserData.brave.hostMac);
    assert.isArray(browserData.brave.regWin);
  });
});

describe('CentBrowser', () => {
  it('should contain centbrowser property', () => {
    assert.property(browserData, 'centbrowser');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.centbrowser, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.centbrowser, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.centbrowser, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isNull(browserData.centbrowser.hostLinux);
    assert.isNull(browserData.centbrowser.hostMac);
    assert.isArray(browserData.centbrowser.regWin);
  });
});

describe('Edge', () => {
  it('should contain edge property', () => {
    assert.property(browserData, 'edge');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.edge, ['alias', 'type']);
  });

  it('should not contain alter alias key', () => {
    assert.doesNotHaveAnyKeys(browserData.edge, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.edge, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isNull(browserData.edge.hostLinux);
    assert.isArray(browserData.edge.hostMac);
    assert.isArray(browserData.edge.regWin);
  });
});

describe('Opera', () => {
  it('should contain opera property', () => {
    assert.property(browserData, 'opera');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.opera, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.opera, ['aliasMac', 'aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.opera, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isNull(browserData.opera.hostLinux);
    assert.isArray(browserData.opera.hostMac);
    assert.isArray(browserData.opera.regWin);
  });
});

describe('Vivaldi', () => {
  it('should contain vivaldi property', () => {
    assert.property(browserData, 'vivaldi');
  });

  it('should contain alias and type keys', () => {
    assert.containsAllKeys(browserData.vivaldi, ['alias', 'type']);
  });

  it('should contain alter alias key', () => {
    assert.containsAllKeys(browserData.vivaldi, ['aliasWin']);
  });

  it('should contain host keys', () => {
    assert.containsAllKeys(browserData.vivaldi, [
      'hostLinux',
      'hostMac',
      'regWin'
    ]);
    assert.isArray(browserData.vivaldi.hostLinux);
    assert.isArray(browserData.vivaldi.hostMac);
    assert.isArray(browserData.vivaldi.regWin);
  });
});
