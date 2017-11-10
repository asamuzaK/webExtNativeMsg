"use strict";
{
  /* api */
  const {assert} = require("chai");
  const {describe, it} = require("mocha");

  /* constant */
  const {DIR_CONFIG, DIR_HOME, IS_WIN, IS_MAC} = require("../modules/constant");

  /* OS specific user config dir */
  describe("DIR_CONFIG", () => {
    it("should get value", () => {
      const dir = IS_WIN && [DIR_HOME, "AppData", "Roaming"] ||
                  IS_MAC && [DIR_HOME, "Library", "Application Support"] ||
                  [DIR_HOME, ".config"];
      assert.deepEqual(dir, DIR_CONFIG);
    });
  });
}
