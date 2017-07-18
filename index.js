/**
 * index.js
 */
"use strict";
{
  /* api */
  const {ChildProcess, CmdArgs} = require("./modules/child-process");
  const {Input, Output} = require("./modules/native-message");
  const {Setup} = require("./modules/setup");

  module.exports = {
    ChildProcess, CmdArgs, Input, Output, Setup,
  };
}
