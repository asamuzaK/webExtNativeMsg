export declare const throwErr: (e: object) => never;
export declare const logErr: (e: object) => boolean;
export declare const logWarn: (msg: string | object) => boolean;
export declare const logMsg: (msg: string | object) => string | object;
export declare const getType: (o: object) => string;
export declare const isString: (o: object) => boolean;
export declare const escapeChar: (str: string, re: RegExp) => string | null;
export declare const quoteArg: (arg: string) => string;
