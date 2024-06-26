[![build](https://github.com/asamuzaK/webExtNativeMsg/workflows/build/badge.svg)](https://github.com/asamuzaK/webExtNativeMsg/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/webExtNativeMsg/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/asamuzaK/webExtNativeMsg/actions/workflows/github-code-scanning/codeql)
[![npm](https://img.shields.io/npm/v/web-ext-native-msg)](https://www.npmjs.com/package/web-ext-native-msg)

# WebExtensions native messaging

Helper modules for WebExtensions native messaging host.

## Supported browsers

|Browser         |Windows|Linux  |Mac    |
|:---------------|:-----:|:-----:|:-----:|
|Firefox         |   ✓   |   ✓   |   ✓   |
|Thunderbird     |   ✓   |   ✓   |   ✓   |
|Waterfox Current|   ✓   |   ✓   |   ✓   |
|LibreWolf       |   ✓ *1|   ✓   |       |
|Chrome          |   ✓   |   ✓   |   ✓   |
|Chrome Beta     |   ✓ *2|   ✓   |   ✓   |
|Chrome Canary   |   ✓ *2|       |   ✓   |
|Chromium        |       |   ✓   |   ✓   |
|Brave           |   ✓ *2|   ✓   |   ✓   |
|Edge            |   ✓   |   ✓   |   ✓   |
|Opera           |   ✓ *2|       |   ✓ *2|
|Vivaldi         |   ✓ *2|   ✓   |   ✓   |

*1: Shares host with Firefox.
*2: Shares host with Chrome.

## Install

```console
npm i web-ext-native-msg
```

## Usage

### Class Setup

Creates shell script, application manifest for specified browser.

Sample:
```javascript
import { Setup } from 'web-ext-native-msg';

const handlerAfterSetup = info => {
  const { configDirPath, shellScriptPath, manifestPath } = info;
  // do something
};

const setup = new Setup({
  hostDescription: 'Description of the host',
  hostName: 'hostname',
  mainScriptFile: 'index.js',
  chromeExtensionIds: ['chrome-extension://xxxxxx'],
  webExtensionIds: ['mywebextension@asamuzak.jp'],
  callback: handlerAfterSetup
});

setup.run();
```

Construct:
* new Setup(opt)
  * @param {Object} [opt] - options which contains optional properties below.

Properties:
* browser: {string} - Specify the browser.
* supportedBrowsers: {Array} - List of supported browsers.
* configPath: {string} - Path to save config files.
  * On Windows, config path defaults to `C:\Users\[UserName]\AppData\Roaming\[hostName]\config\`.
  * On Mac, `~/Library/Application Support/[hostName]/config/`.
  * On Linux, `~/.config/[hostName]/config/`.
* overwriteConfig: {boolean} - Overwrite config if exists. Defaults to `false`.
* hostName: {string} - Host name.
* hostDescription: {string} - Host description.
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
* run(): Runs setup script.
  * @returns {?Promise.&lt;void&gt;}

### Class Input / Output

Decode / encode native messages exchanged between browser and host.

Sample:
```javascript
import process from 'node:process';
import { Input, Output } from 'web-ext-native-msg';

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

process.stdin.on('data', readStdin);
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
```javascript
import path from 'node:path';
import process from 'node:process';
import { ChildProcess, CmdArgs } from 'web-ext-native-msg';

const arg = '-a -b -c';
const cmdArgs = (new CmdArgs(arg)).toArray();

const app = path.resolve(path.join('path', 'to', 'myApp.exe'));
const file = path.resolve(path.join('path', 'to', 'myFile.txt'));
const opt = {
  cwd: null,
  encoding: 'utf8',
  env: process.env
};

const proc = (new ChildProcess(app, cmdArgs, opt)).spawn(file).catch(e => {
  throw e;
});
```

Construct:
* new CmdArgs(arg)
  * @param {string|Array} arg - argument input
* new ChildProcess(app, args, opt)
  * @param {string} app - application path
  * @param {string|Array} [args] - command arguments
  * @param {Object} [opt] - options. Defaults to `{cwd: null, env: process.env}`.

CmdArgs methods:
* toArray(): Arguments to array.
  * @returns {Array} - arguments array or empty array
* toString(): Arguments array to string.
  * @returns {string} - arguments string or empty string

ChildProcess method:
* spawn(file): Spawn child process. Async.
  * @param {string} [file] - file path
  * @returns {Object} - child process

### Function convertUriToFilePath(uri)

Converts URI to native file path.

* @param {string} uri - URI
* @returns {?string} - file path, nullable

### Function getAbsPath(file)

Get absolute path.

* @param {string} file - file path
* @returns {?string} - absolute file path, nullable

### Function getFileNameFromFilePath(file, subst)

Get file name from native file path.

* @param {string} file - file path
* @param {string} [subst] - substitute file name. Defaults to `index`
* @returns {string} - file name

### Function getStat(file)

Get file stat.

* @param {string} file - file path
* @returns {Object} - file stat, nullable

### Function removeDir(dir, baseDir)

Remove the directory and it's files.
Note: `dir` should be subdirectory of `baseDir`.

* @param {string} dir - directory path
* @param {string} baseDir - base directory path
* @returns {void}

### Async Function removeDirectory(dir, baseDir)

Remove the directory and it's files.
Note: `dir` should be subdirectory of `baseDir`.

* @param {string} dir - directory path
* @param {string} baseDir - base directory path
* @returns {void}

### Async Function createDirectory(dir, mode)

Create a directory.

* @param {string} dir - directory path to create
* @param {number} [mode] - permission. Defaults to `0o777`
* @returns {string} - directory path

### Async Function createFile(file, value, opt)

Create a file.

* @param {string} file - file path
* @param {string|Buffer|Uint8Array} value - value to write
* @param {Object} [opt] - options
* @param {string} [opt.encoding] - encoding. Defaults to `null`
* @param {string} [opt.flag] - flag. Defaults to `'w'`
* @param {number|string} [opt.mode] - file permission. Defaults to `0o666`
* @returns {string} - file path

### Async Function readFile(file, opt)

Read a file.

* @param {string} file - file path
* @param {Object} [opt] - options
* @param {string} [opt.encoding] - encoding. Defaults to `null`
* @param {string} [opt.flag] - flag. Defaults to `'r'`
* @returns {string|Buffer} - file content

### Function isDir(dir)

The directory is a directory or not.

* @param {string} dir - directory path
* @returns {boolean} - result

### Function isSubDir(dir, baseDir)

The directory is a subdirectory of a certain directory or not.

* @param {string} dir - directory path
* @param {string} baseDir - base directory path
* @returns {boolean} - result

### Function isFile(file)

The file is a file or not.

* @param {string} file - file path
* @returns {boolean} - result

### Function isExecutable(file, mask)

The file is executable or not.

* @param {string} file - file path
* @param {number} [mask] - mask bit. Defaults to `0o111`
* @returns {boolean} - result
