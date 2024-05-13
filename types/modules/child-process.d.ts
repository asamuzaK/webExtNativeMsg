export class ChildProcess {
    constructor(cmd: string, args?: string | any[], opt?: object);
    private _getSpawnArgs;
    spawn(file?: string): Promise<object>;
    #private;
}
