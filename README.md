EN | [JA](./README.ja.md)

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
const {Setup} = require("webExtNativeMsg/index.js");

const setup = new Setup({
  hostDescription: "Description of the host",
  hostName: "hostname",
  mainScriptFile: "index.js",
  chromeExtensionIds: "chrome-extension://xxxxxx",
  webExtensionIds: "mywebextension@asamuzak.jp",
});

setup.run();
```

### Class Input / Output

Sample:
```
const {Input, Output} = require("webExtNativeMsg/index.js");
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

const input = new Input();

const handleMsg = async msg => {
  // do something
};

const readStdin = chunk => {
  const arr = input.decode(chunk);
  const func = [];
  Array.isArray(arr) && arr.length && arr.forEach(msg => {
    msg && func.push(handleMsg(msg));
  });
  return Promise.all(func).catch(handleReject);
};
```
