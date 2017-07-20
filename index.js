/**
 * index.js
 */
"use strict";
{
  const {versions: {node}} = require("process");

  let [nodeMajor] = node.split(".");
  nodeMajor = Number(nodeMajor);

  if (!Number.isInteger(nodeMajor) || nodeMajor < 8) {
    throw new Error("Only runs in node >= 8");
  }

  /* api */
  const {ChildProcess, CmdArgs} = require("./modules/child-process");
  const {Input, Output} = require("./modules/native-message");
  const {Setup} = require("./modules/setup");

  module.exports = {
    ChildProcess, CmdArgs, Input, Output, Setup,
  };
}
