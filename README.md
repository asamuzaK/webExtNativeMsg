# WebExtensions native messaging

Native messaging host modules for WebExtensions.

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

## Usage

### Class Setup

Sample:
```
const {Setup} = require("webExtNativeMsg/index");

const setup = new Setup({
  hostDescription: "Description of the host",
  hostName: "hostname",
  mainScriptFile: "index.js",
  chromeExtensionIds: ["chrome-extension://xxxxxx"],
  webExtensionIds: ["mywebextension@asamuzak.jp"],
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

Methods:
* setConfigDir(dir): Sets config directory. Defaults to `[cwd]/config/`.
  * @param {string} dir - directory path
  * @returns {void}
* run(): Runs setup script.
  * @returns {void}

### Class Input / Output

Sample:
```
const {Input, Output} = require("webExtNativeMsg/index");
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

Sample:
```
const {ChildProcess, CmdArgs} = require("webExtNativeMsg/index");
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
