export declare const concatArray: (arrA: any[], arrB: any[]) => any[];
export declare const correctArg: (arg: string) => string;
export declare const extractArg: (arg: string) => Array<string | undefined>;
export declare const stringifyArg: (arg: string) => string;
export declare class CmdArgs {
    #private;
    constructor(input: string | any[]);
    toArray(): any[];
    toString(): string;
}
export declare class ChildProcess {
    #private;
    constructor(cmd: string, args?: string | any[], opt?: object);
    private _getSpawnArgs;
    spawn(file?: string): Promise<object>;
}
