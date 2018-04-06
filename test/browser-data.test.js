"use strict";
{
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

  describe("Cyberfox", () => {
    it("should contain cyberfox property", () => {
      assert.property(browserData, "cyberfox");
    });

    it("should contain alias and type keys", () => {
      assert.containsAllKeys(browserData.cyberfox, ["alias", "type"]);
    });

    it("should contain alter alias key", () => {
      assert.hasAnyKeys(browserData.cyberfox, ["aliasMac", "aliasWin"]);
    });

    it("should contain host keys", () => {
      assert.hasAnyKeys(browserData.cyberfox,
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
      assert.hasAnyKeys(browserData.waterfox, ["aliasMac", "aliasWin"]);
    });

    it("should contain host keys", () => {
      assert.hasAnyKeys(browserData.waterfox,
                        ["hostLinux", "hostMac", "regWin"]);
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
      assert.hasAnyKeys(browserData.chrome,
                        ["hostLinux", "hostMac", "regWin"]);
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
      assert.hasAnyKeys(browserData.chromium,
                        ["hostLinux", "hostMac", "regWin"]);
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
      assert.hasAnyKeys(browserData.kinza, ["aliasMac", "aliasWin"]);
    });

    it("should contain host keys", () => {
      assert.hasAnyKeys(browserData.kinza,
                        ["hostLinux", "hostMac", "regWin"]);
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
      assert.hasAnyKeys(browserData.opera, ["aliasMac", "aliasWin"]);
    });

    it("should contain host keys", () => {
      assert.hasAnyKeys(browserData.opera,
                        ["hostLinux", "hostMac", "regWin"]);
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
      assert.hasAnyKeys(browserData.vivaldi, ["aliasMac", "aliasWin"]);
    });

    it("should contain host keys", () => {
      assert.hasAnyKeys(browserData.vivaldi,
                        ["hostLinux", "hostMac", "regWin"]);
    });
  });
}
