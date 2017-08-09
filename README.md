[![Build Status](https://travis-ci.org/asamuzaK/webExtNativeMsg.svg?branch=master)](https://travis-ci.org/asamuzaK/webExtNativeMsg)
[![devDependency Status](https://david-dm.org/asamuzaK/webExtNativeMsg/dev-status.svg)](https://david-dm.org/asamuzaK/webExtNativeMsg#info=devDependencies)

# WebExtensions native messaging

Helper modules for WebExtensions native messaging host.

## Supported browsers

|Browser |Windows|Linux  |Mac    |
|:-------|:-----:|:-----:|:-----:|
|Firefox |   ✓   |   ✓   |   ✓   |
|Cyberfox|   ✓ *1|       |       |
|Waterfox|   ✓ *1|       |       |
|Chrome  |   ✓   |   ✓   |   ✓   |
|Chromium|       |   ✓   |   ✓   |
|Kinza   |   ✓ *2|       |       |
|Opera   |   ✓ *2|       |   ✓ *2|
|Vivaldi |   ✓ *2|   ✓   |   ✓   |

*1: Shares host with Firefox.
*2: Shares host with Chrome.

## Install

```
npm install web-ext-native-msg
```

## Usage

### Class Setup

Creates shell script, application manifest for specified browser.

Sample:
```
const {Setup} = require("web-ext-native-msg");

const postSetup = info => {
  const {configDirPath, shellScriptPath, manifestPath} = info;
  // do something
};

const setup = new Setup({
  hostDescription: "Description of the host",
  hostName: "hostname",
  mainScriptFile: "index.js",
  chromeExtensionIds: ["chrome-extension://xxxxxx"],
  webExtensionIds: ["mywebextension@asamuzak.jp"],
  callback: postSetup,
});

setup.run();
```

Construct:
* new Setup(opt)
  * @param {Object} opt - options which contains properties below.

Properties:
* hostDescription: {string} - Host description.
* hostName: {string} - Host name.
* mainScriptFile: {string} - File name of the main script. Defaults to `index.js`.
* chromeExtensionIds: {Array} - Array of chrome extension IDs.
* webExtensionIds: {Array} - Array of web extension IDs.
* callback: {Function} - A function that will be called when setup is done.
  * The function will be passed an argument containing information about the paths of the created files.
    ```
    {
      configDirPath: {string} - Config dir path.
      shellScriptPath: {string} - Shell script path.
      manifestPath: {string} - Application manifest path.
    }
    ```

Methods:
* setConfigDir(dir): Sets config directory. Config directory defaults to `[cwd]/config/`.
  * @param {string} dir - directory path
  * @returns {void}
* run(): Runs setup script.
  * @returns {void}

### Class Input / Output

Decode / encode native messages exchanged between browser and host.

Sample:
```
const {Input, Output} = require("web-ext-native-msg");
const process = require("process");

const handleReject = e => {
  e = (new Output()).encode(e);
  e && process.stdout.write(e);
  return false;
};

const writeStdout = async msg => {
  msg = await (new Output()).encode(msg);
  return msg && process.stdout.write(msg);
};

const handleMsg = async msg => {
  // do something
};

const input = new Input();

const readStdin = chunk => {
  const arr = input.decode(chunk);
  const func = [];
  Array.isArray(arr) && arr.length && arr.forEach(msg => {
    msg && func.push(handleMsg(msg));
  });
  return Promise.all(func).catch(handleReject);
};

process.stdin.on("data", readStdin);
```

Construct:
* new Input();
* new Output();

Input method:
* decode(chunk): Decodes message from buffer.
  * @param {string|Buffer} chunk - chunk
  * @returns {?Array} - message array, nullable

Output method:
* encode(msg): Encodes message to buffer.
  * @param {Object} msg - message
  * @returns {?Buffer} - buffered message, nullable

### Class ChildProcess / CmdArgs

Spawns child process.

Sample:
```
const {ChildProcess, CmdArgs} = require("web-ext-native-msg");
const process = require("process");

const arg = "-a -b -c";
const cmdArgs = (new CmdArgs(arg)).toArray();

const app = "/path/to/myApp.exe";
const file = "/path/to/myFile.txt";
const pos = false;
const opt = {
  cwd: null,
  encoding: "utf8",
  env: process.env,
};

const proc = new ChildProcess(app, cmdArgs, opt);

proc.spawn(file, pos);
```

Construct:
* new CmdArgs(arg)
  * @param {string|Array} arg - argument input
* new ChildProcess(app, args, opt)
  * @param {string} app - application path
  * @param {string|Array} args - command arguments
  * @param {Object} opt - options. Defaults to `{cwd: null, env: process.env}`.

CmdArgs methods:
* toArray(): Arguments to array.
  * @returns {Array} - arguments array or empty array
* toString(): Arguments array to string.
  * @returns {string} - arguments string or empty string

ChildProcess method:
* spawn(file, pos): Spawn child process. Async.
  * @param {string} file - file path
  * @param {boolean} pos - put file path after cmd args. Defaults to `false`.
  * @returns {Object} - child process

## Function convertUriToFilePath(uri)

Converts URI to native file path.

* @param {string} uri - URI
* @returns {?string} - file path, nullable

## Function getAbsPath(file)

Get absolute path.

* @param {string} file - file path
* @returns {?string} - absolute file path, nullable

## Function getFileNameFromFilePath(file, subst)

Get file name from native file path.

* @param {string} file - file path
* @param {string} subst - substitute file name, defaults to `index`
* @returns {string} - file name

## Function getStat(file)

Get file stat.

* @param {string} file - file path
* @returns {Object} - file stat, nullable

## Function removeDir(dir, baseDir)

Remove the directory and it's files.
Note: `dir` should be subdirectory of `baseDir`.

* @param {string} dir - directory path
* @param {string} baseDir - base directory path
* @returns {void}

## Function createDir(arr, mode)

Create a directory.
Note: first argument should be array of directory label, like `["path", "to", "dir"]`.

* @param {Array} arr - directory array
* @param {string|number} mode - permission
* @returns {?string} - directory path

## Async Function createFile(file, value, opt)

Create a file.

* @param {string} file - file path
* @param {string|Buffer|Uint8Array} value - value to write
* @param {Object} opt - option
* @param {string} [opt.encoding] - encoding, defaults to `null`
* @param {string} [opt.flag] - flag, defaults to `"w"`
* @param {number|string} [opt.mode] - file permission, defaults to `0o666`
* @returns {?string} - file path, nullable

## Async Function readFile(file, opt)

Read a file.

* @param {string} file - file path
* @param {Object} opt - option
* @param {string} [opt.encoding] - encoding, defaults to `null`
* @param {string} [opt.flag] - flag, defaults to `"r"`
* @returns {string|Buffer} - file content

## Function isDir(dir)

The directory is a directory or not.

* @param {string} dir - directory path
* @returns {boolean} - result

## Function isSubDir(dir, baseDir)

The directory is a subdirectory of a certain directory or not.

* @param {string} dir - directory path
* @param {string} baseDir - base directory path
* @returns {boolean} - result

## Function isFile(file)

The file is a file or not.

* @param {string} file - file path
* @returns {boolean} - result

## Function isExecutable(file, mask)

The file is executable or not.

* @param {string} file - file path
* @param {number} mask - mask bit, defaults to `0o111`
* @returns {boolean} - result
