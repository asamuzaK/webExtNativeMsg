export function throwErr(e: object): never;
export function logErr(e: object): boolean;
export function logWarn(msg: any): boolean;
export function logMsg(msg: any): any;
export function getType(o: any): string;
export function isString(o: any): boolean;
export function escapeChar(str: string, re: RegExp): string | null;
export function quoteArg(arg: string): string;
