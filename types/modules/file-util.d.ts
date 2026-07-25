export declare const convertUriToFilePath: (uri: string) => string | null;
export declare const getAbsPath: (file: string) => string | null;
export declare const getStat: (file: string) => object;
export declare const isDir: (dir: string) => boolean;
export declare const isSubDir: (dir: string, baseDir: string) => boolean;
export declare const isFile: (file: string) => boolean;
export declare const isExecutable: (file: string, mask?: number) => boolean;
export declare const getFileTimestamp: (file: string) => number;
export declare const getFileNameFromFilePath: (file: string, subst?: string) => string;
export declare const removeDirSync: (dir: string, baseDir: string) => void;
export declare const removeDirectory: (dir: string, baseDir: string) => Promise<void>;
export declare const createDirectory: (dir: string, mode?: number) => Promise<string>;
export declare const createFile: (file: string, value: string | Buffer | Uint8Array, opt?: {
    encoding?: string;
    flag?: string;
    mode?: number | string;
}) => Promise<string>;
export declare const readFile: (file: string, opt?: {
    encoding?: string;
    flag?: string;
}) => Promise<string | Buffer>;
