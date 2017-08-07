"use strict";
{
  /* api */
  const {browserData} = require("../modules/browser-data");
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  describe("Browser Data", () => {
    it("should contain firefox property", async () => {
      assert.property(browserData, "firefox");
    });

    it("should contain cyberfox property", async () => {
      assert.property(browserData, "cyberfox");
    });

    it("should contain waterfox property", async () => {
      assert.property(browserData, "waterfox");
    });

    it("should contain chrome property", async () => {
      assert.property(browserData, "chrome");
    });

    it("should contain chromium property", async () => {
      assert.property(browserData, "chromium");
    });

    it("should contain kinza property", async () => {
      assert.property(browserData, "kinza");
    });

    it("should contain opera property", async () => {
      assert.property(browserData, "opera");
    });

    it("should contain vivaldi property", async () => {
      assert.property(browserData, "vivaldi");
    });
  });
}
