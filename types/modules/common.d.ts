export function throwErr(e: object): never;
export function logErr(e: object): boolean;
export function logWarn(msg: string | object): boolean;
export function logMsg(msg: string | object): string | object;
export function getType(o: object): string;
export function isString(o: object): boolean;
export function escapeChar(str: string, re: RegExp): string | null;
export function quoteArg(arg: string): string;
