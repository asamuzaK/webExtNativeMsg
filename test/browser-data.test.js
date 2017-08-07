"use strict";
{
  /* api */
  const {browserData} = require("../modules/browser-data");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  describe("browserData", () => {
    describe("Firefox", () => {
      it("should contain property", async () => {
        assert.property(browserData, "firefox");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.firefox, ["alias", "type"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.firefox,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Cyberfox", () => {
      it("should contain property", async () => {
        assert.property(browserData, "cyberfox");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.cyberfox, ["alias", "type"]);
      });

      it("should contain alter alias key", async () => {
        assert.hasAnyKeys(browserData.cyberfox, ["aliasMac", "aliasWin"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.cyberfox,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Waterfox", () => {
      it("should contain property", async () => {
        assert.property(browserData, "waterfox");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.waterfox, ["alias", "type"]);
      });

      it("should contain alter alias key", async () => {
        assert.hasAnyKeys(browserData.waterfox, ["aliasMac", "aliasWin"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.waterfox,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Chrome", () => {
      it("should contain property", async () => {
        assert.property(browserData, "chrome");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.chrome, ["alias", "type"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.chrome,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Chromium", () => {
      it("should contain property", async () => {
        assert.property(browserData, "chromium");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.chromium, ["alias", "type"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.chromium,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Kinza", () => {
      it("should contain property", async () => {
        assert.property(browserData, "kinza");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.kinza, ["alias", "type"]);
      });

      it("should contain alter alias key", async () => {
        assert.hasAnyKeys(browserData.kinza, ["aliasMac", "aliasWin"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.kinza,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Opera", () => {
      it("should contain property", async () => {
        assert.property(browserData, "opera");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.opera, ["alias", "type"]);
      });

      it("should contain alter alias key", async () => {
        assert.hasAnyKeys(browserData.opera, ["aliasMac", "aliasWin"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.opera,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });

    describe("Vivaldi", () => {
      it("should contain property", async () => {
        assert.property(browserData, "vivaldi");
      });

      it("should contain alias and type keys", async () => {
        assert.containsAllKeys(browserData.vivaldi, ["alias", "type"]);
      });

      it("should contain alter alias key", async () => {
        assert.hasAnyKeys(browserData.vivaldi, ["aliasMac", "aliasWin"]);
      });

      it("should contain host keys", async () => {
        assert.hasAnyKeys(browserData.vivaldi,
                          ["hostLinux", "hostMac", "regWin"]);
      });
    });
  });
}
