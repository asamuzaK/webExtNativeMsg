/*!
 * WebExtensions native messaging
 *
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/webExtNativeMsg/blob/master/LICENSE}
 */

export { ChildProcess } from './modules/child-process.js';
export { Input, Output } from './modules/native-message.js';
export { Setup } from './modules/setup.js';
export {
  convertUriToFilePath, createDirectory, createFile,
  getAbsPath, getFileNameFromFilePath, getFileTimestamp, getStat,
  isDir, isExecutable, isFile, isSubDir, readFile, removeDir, removeDirectory
} from './modules/file-util.js';
