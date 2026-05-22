# WebExtensions native messaging

[![build](https://github.com/asamuzaK/webExtNativeMsg/workflows/build/badge.svg)](https://github.com/asamuzaK/webExtNativeMsg/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/webExtNativeMsg/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/asamuzaK/webExtNativeMsg/actions/workflows/github-code-scanning/codeql)
[![npm](https://img.shields.io/npm/v/web-ext-native-msg)](https://www.npmjs.com/package/web-ext-native-msg)

Helper modules for building WebExtensions native messaging hosts.

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

*1: Shares host with Firefox.*
*2: Shares host with Chrome.*

## Install

```console
npm i web-ext-native-msg
```

## Usage

### Class Setup

Interactively creates a shell script and application manifest for the specified browser, and registers the host in the Windows Registry (if applicable).

Sample:
```javascript
import { Setup } from 'web-ext-native-msg';

const handlerAfterSetup = info => {
  const { configDirPath, shellScriptPath, manifestPath } = info;
  console.log('Setup completed successfully:', shellScriptPath);
  // do something
};

const setup = new Setup({
  hostDescription: 'Description of the host',
  hostName: 'my_native_host',
  mainScriptFile: 'index.js',
  chromeExtensionIds: ['chrome-extension://xxxxxx'],
  webExtensionIds: ['mywebextension@asamuzak.jp']
});

// Promise chain approach
setup.run()
  .then(handlerAfterSetup)
  .catch(err => {
    console.error('Setup failed or aborted:', err.message);
  });
```

Construct:
* `new Setup([opt])`
  * `@param {Object} [opt]` - Options which contain optional properties below.

Properties:
* `browser`: `{string}` - Specify the browser.
* `supportedBrowsers`: `{Array}` - List of supported browsers.
* `configPath`: `{string}` - Path to save config files.
  * On Windows, config path defaults to `C:\Users\[UserName]\AppData\Roaming\[hostName]\config\`.
  * On Mac, `~/Library/Application Support/[hostName]/config/`.
  * On Linux, `~/.config/[hostName]/config/`.
* `overwriteConfig`: `{boolean}` - Overwrite config if it already exists. Defaults to `false`.
* `hostName`: `{string}` - Host name.
* `hostDescription`: `{string}` - Host description.
* `mainScriptFile`: `{string}` - File name of the main script. Defaults to `index.js`.
* `chromeExtensionIds`: `{Array}` - Array of Chrome extension IDs.
* `webExtensionIds`: `{Array}` - Array of Web Extension IDs.
* `callback`: `{Function}` - A function that will be called when setup is done (legacy approach).

Methods:
* `run()`: Runs the setup script asynchronously.
  * `@returns {Promise.<Object>}` - An object containing information about the created files:
    ```javascript
    {
      configDirPath: {string} - Config directory path.
      shellScriptPath: {string} - Shell script path.
      manifestPath: {string} - Application manifest path.
    }
    ```

### Class Input / Output

Decodes / encodes native messages exchanged between the browser and the host via standard input/output.

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
  // Process the received message
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
* `new Input()`
* `new Output()`

Input method:
* `decode(chunk)`: Decodes a message from the buffer.
  * `@param {string|Buffer} chunk` - Buffer chunk
  * `@returns {?Array}` - Decoded message array (nullable)

Output method:
* `encode(msg)`: Encodes a message to the buffer.
  * `@param {Object} msg` - Message to encode
  * `@returns {?Buffer}` - Buffered message (nullable)

### Class ChildProcess / CmdArgs

Safely handles command arguments and spawns child processes.

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

const proc = await (new ChildProcess(app, cmdArgs, opt)).spawn(file).catch(e => {
  throw e;
});
```

Construct:
* `new CmdArgs(arg)`
  * `@param {string|Array} arg` - Argument input
* `new ChildProcess(app, [args], [opt])`
  * `@param {string} app` - Application executable path
  * `@param {string|Array} [args]` - Command arguments
  * `@param {Object} [opt]` - Options. Defaults to `{cwd: null, env: process.env}`.

CmdArgs methods:
* `toArray()`: Parses arguments into an array.
  * `@returns {Array}` - Arguments array (or empty array)
* `toString()`: Joins the arguments array into a string.
  * `@returns {string}` - Arguments string (or empty string)

ChildProcess method:
* `spawn([file])`: Spawns the child process. Async.
  * `@param {string} [file]` - File path to append as the last argument
  * `@returns {Promise.<Object>}` - Child process instance

### Utility Functions

#### `convertUriToFilePath(uri)`
Converts a URI to a native file path.
* `@param {string} uri` - URI
* `@returns {?string}` - File path (nullable)

#### `getAbsPath(file)`
Gets the absolute path.
* `@param {string} file` - File path
* `@returns {?string}` - Absolute file path (nullable)

#### `getFileNameFromFilePath(file, [subst])`
Gets the file name from a native file path without its extension.
* `@param {string} file` - File path
* `@param {string} [subst]` - Substitute file name. Defaults to `'index'`
* `@returns {string}` - File name

#### `getStat(file)`
Gets the file stat.
* `@param {string} file` - File path
* `@returns {Object}` - File stat (nullable)

#### `removeDirSync(dir, baseDir)`
Synchronously removes the directory and its files.
**Note:** `dir` must be a subdirectory of `baseDir` for safety.
* `@param {string} dir` - Directory path
* `@param {string} baseDir` - Base directory path
* `@returns {void}`

#### `removeDirectory(dir, baseDir)`
Asynchronously removes the directory and its files.
**Note:** `dir` must be a subdirectory of `baseDir` for safety.
* `@param {string} dir` - Directory path
* `@param {string} baseDir` - Base directory path
* `@returns {Promise.<void>}`

#### `createDirectory(dir, [mode])`
Asynchronously creates a directory.
* `@param {string} dir` - Directory path to create
* `@param {number} [mode]` - Permission mode. Defaults to `0o777`
* `@returns {Promise.<string>}` - Created directory path

#### `createFile(file, value, [opt])`
Asynchronously creates a file.
* `@param {string} file` - File path to create
* `@param {string|Buffer|Uint8Array} value` - Value to write
* `@param {Object} [opt]` - Options
* `@param {string} [opt.encoding]` - Encoding. Defaults to `null`
* `@param {string} [opt.flag]` - File system flag. Defaults to `'w'`
* `@param {number|string} [opt.mode]` - File permission. Defaults to `0o666`
* `@returns {Promise.<string>}` - Created file path

#### `readFile(file, [opt])`
Asynchronously reads a file.
* `@param {string} file` - File path
* `@param {Object} [opt]` - Options
* `@param {string} [opt.encoding]` - Encoding. Defaults to `null`
* `@param {string} [opt.flag]` - File system flag. Defaults to `'r'`
* `@returns {Promise.<string|Buffer>}` - File content

#### `isDir(dir)`
Checks if the given path is a directory.
* `@param {string} dir` - Directory path
* `@returns {boolean}` - Result

#### `isSubDir(dir, baseDir)`
Checks if the directory is a subdirectory of a certain directory.
* `@param {string} dir` - Directory path
* `@param {string} baseDir` - Base directory path
* `@returns {boolean}` - Result

#### `isFile(file)`
Checks if the given path is a file.
* `@param {string} file` - File path
* `@returns {boolean}` - Result

#### `isExecutable(file, [mask])`
Checks if the file is executable.
* `@param {string} file` - File path
* `@param {number} [mask]` - Mask bit. Defaults to `0o111`
* `@returns {boolean}` - Result
