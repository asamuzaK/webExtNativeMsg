export function concatArray(arrA: any[], arrB: any[]): any[];
export function correctArg(arg: string): string;
export function extractArg(arg: string): Array<string | undefined>;
export function stringifyArg(arg: string): string;
export class CmdArgs {
    constructor(input: string | any[]);
    toArray(): any[];
    toString(): string;
    #private;
}
export class ChildProcess {
    constructor(cmd: string, args?: string | any[], opt?: object);
    private _getSpawnArgs;
    spawn(file?: string): Promise<object>;
    #private;
}
