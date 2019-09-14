"use strict";
/* api */
const {browserData} = require("../modules/browser-data");
const {assert} = require("chai");
const {describe, it} = require("mocha");

describe("Firefox", () => {
  it("should contain firefox property", () => {
    assert.property(browserData, "firefox");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.firefox, ["alias", "type"]);
  });

  it("should contain host keys", () => {
    assert.hasAnyKeys(browserData.firefox,
                      ["hostLinux", "hostMac", "regWin"]);
  });
});

describe("Waterfox", () => {
  it("should contain waterfox property", () => {
    assert.property(browserData, "waterfox");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.waterfox, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.waterfox, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.waterfox,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isNull(browserData.waterfox.hostLinux);
    assert.isNull(browserData.waterfox.hostMac);
    assert.isArray(browserData.waterfox.regWin);
  });
});

describe("Chrome", () => {
  it("should contain chrome property", () => {
    assert.property(browserData, "chrome");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.chrome, ["alias", "type"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.chrome,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isArray(browserData.chrome.hostLinux);
    assert.isArray(browserData.chrome.hostMac);
    assert.isArray(browserData.chrome.regWin);
  });
});

describe("Chrome Canary", () => {
  it("should contain chromecanary property", () => {
    assert.property(browserData, "chromecanary");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.chromecanary, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.chromecanary, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.chromecanary,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isNull(browserData.chromecanary.hostLinux);
    assert.isArray(browserData.chromecanary.hostMac);
    assert.isArray(browserData.chromecanary.regWin);
  });
});

describe("Chromium", () => {
  it("should contain chromium property", () => {
    assert.property(browserData, "chromium");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.chromium, ["alias", "type"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.chromium,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isArray(browserData.chromium.hostLinux);
    assert.isArray(browserData.chromium.hostMac);
    assert.isNull(browserData.chromium.regWin);
  });
});

describe("Brave", () => {
  it("should contain brave property", () => {
    assert.property(browserData, "brave");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.brave, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.brave, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.brave,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isArray(browserData.brave.hostLinux);
    assert.isNull(browserData.brave.hostMac);
    assert.isArray(browserData.brave.regWin);
  });
});

describe("CentBrowser", () => {
  it("should contain centbrowser property", () => {
    assert.property(browserData, "centbrowser");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.centbrowser, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.centbrowser, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.centbrowser,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isNull(browserData.centbrowser.hostLinux);
    assert.isNull(browserData.centbrowser.hostMac);
    assert.isArray(browserData.centbrowser.regWin);
  });
});

describe("Kinza", () => {
  it("should contain kinza property", () => {
    assert.property(browserData, "kinza");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.kinza, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.kinza, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.kinza,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isNull(browserData.kinza.hostLinux);
    assert.isNull(browserData.kinza.hostMac);
    assert.isArray(browserData.kinza.regWin);
  });
});

describe("Opera", () => {
  it("should contain opera property", () => {
    assert.property(browserData, "opera");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.opera, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.opera, ["aliasMac", "aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.opera,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isNull(browserData.opera.hostLinux);
    assert.isArray(browserData.opera.hostMac);
    assert.isArray(browserData.opera.regWin);
  });
});

describe("Vivaldi", () => {
  it("should contain vivaldi property", () => {
    assert.property(browserData, "vivaldi");
  });

  it("should contain alias and type keys", () => {
    assert.containsAllKeys(browserData.vivaldi, ["alias", "type"]);
  });

  it("should contain alter alias key", () => {
    assert.containsAllKeys(browserData.vivaldi, ["aliasWin"]);
  });

  it("should contain host keys", () => {
    assert.containsAllKeys(browserData.vivaldi,
                           ["hostLinux", "hostMac", "regWin"]);
    assert.isArray(browserData.vivaldi.hostLinux);
    assert.isArray(browserData.vivaldi.hostMac);
    assert.isArray(browserData.vivaldi.regWin);
  });
});
