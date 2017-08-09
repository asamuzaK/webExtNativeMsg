/**
 * index.js
 */
"use strict";
{
  /* check for nodejs version */
  const {versions: {node: nodeVersion}} = require("process");
  const NODE_MAJOR = 8;

  let [nodeMajor] = nodeVersion.split(".");
  nodeMajor = Number(nodeMajor);

  if (!Number.isInteger(nodeMajor) || nodeMajor < NODE_MAJOR) {
    throw new Error(`Only runs in node >= ${NODE_MAJOR}`);
  }

  /* api */
  const {ChildProcess, CmdArgs} = require("./modules/child-process");
  const {Input, Output} = require("./modules/native-message");
  const {Setup} = require("./modules/setup");
  const {
    convertUriToFilePath, createDir, createFile, getAbsPath,
    getFileNameFromFilePath, getFileTimestamp, getStat, isDir,
    isExecutable, isFile, isSubDir, removeDir, readFile,
  } = require("./modules/file-util");

  module.exports = {
    ChildProcess, CmdArgs, Input, Output, Setup,
    convertUriToFilePath, createDir, createFile, getAbsPath,
    getFileNameFromFilePath, getFileTimestamp, getStat, isDir, isExecutable,
    isFile, isSubDir, readFile, removeDir,
  };
}
