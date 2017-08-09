"use strict";
{
  /* api */
  const {browserData} = require("../modules/browser-data");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  describe("browserData", () => {
    it("should contain firefox property", () => {
      assert.property(browserData, "firefox");
    });

    describe("Firefox", () => {
      it("should contain alias and type keys", () => {
        assert.containsAllKeys(browserData.firefox, ["alias", "type"]);
      });

      it("should contain host keys", () => {
        assert.hasAnyKeys(browserData.firefox,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    it("should contain cyberfox property", () => {
      assert.property(browserData, "cyberfox");
    });

    describe("Cyberfox", () => {
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

    it("should contain waterfox property", () => {
      assert.property(browserData, "waterfox");
    });

    describe("Waterfox", () => {
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

    it("should contain chrome property", () => {
      assert.property(browserData, "chrome");
    });

    describe("Chrome", () => {
      it("should contain alias and type keys", () => {
        assert.containsAllKeys(browserData.chrome, ["alias", "type"]);
      });

      it("should contain host keys", () => {
        assert.hasAnyKeys(browserData.chrome,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    it("should contain chromium property", () => {
      assert.property(browserData, "chromium");
    });

    describe("Chromium", () => {
      it("should contain alias and type keys", () => {
        assert.containsAllKeys(browserData.chromium, ["alias", "type"]);
      });

      it("should contain host keys", () => {
        assert.hasAnyKeys(browserData.chromium,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    it("should contain kinza property", () => {
      assert.property(browserData, "kinza");
    });

    describe("Kinza", () => {
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

    it("should contain opera property", () => {
      assert.property(browserData, "opera");
    });

    describe("Opera", () => {
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

    it("should contain vivaldi property", () => {
      assert.property(browserData, "vivaldi");
    });

    describe("Vivaldi", () => {
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
  });
}
