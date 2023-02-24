export function convertUriToFilePath(uri: string): string | null;
export function getAbsPath(file: string): string | null;
export function getStat(file: string): object;
export function isDir(dir: string): boolean;
export function isSubDir(dir: string, baseDir: string): boolean;
export function isFile(file: string): boolean;
export function isExecutable(file: string, mask?: number): boolean;
export function getFileTimestamp(file: string): number;
export function getFileNameFromFilePath(file: string, subst?: string): string;
export function removeDir(dir: string, baseDir: string): void;
export function removeDirectory(dir: string, baseDir: string): Promise<void>;
export function createDirectory(dir: string, mode?: number): Promise<string>;
export function createFile(file: string, value: string | Buffer | Uint8Array, opt?: {
    encoding?: string;
    flag?: string;
    mode?: number | string;
}): Promise<string>;
export function readFile(file: string, opt?: {
    encoding?: string;
    flag?: string;
}): Promise<string | Buffer>;
