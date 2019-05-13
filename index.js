/**
 * index.js
 */
"use strict";
/* api */
const {ChildProcess, CmdArgs} = require("./modules/child-process");
const {Input, Output} = require("./modules/native-message");
const {Setup} = require("./modules/setup");
const {
  convertUriToFilePath, createDirectory, createFile,
  getAbsPath, getFileNameFromFilePath, getFileTimestamp, getStat,
  isDir, isExecutable, isFile, isSubDir, readFile, removeDir, removeDirectory,
} = require("./modules/file-util");

module.exports = {
  ChildProcess, CmdArgs, Input, Output, Setup,
  convertUriToFilePath, createDirectory, createFile,
  getAbsPath, getFileNameFromFilePath, getFileTimestamp, getStat,
  isDir, isExecutable, isFile, isSubDir, readFile, removeDir, removeDirectory,
};
