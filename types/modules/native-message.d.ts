export declare class Input {
    #private;
    constructor();
    private #decoder;
    decode(chunk: string | Buffer): Array<string> | null;
}
export declare class Output {
    #private;
    constructor();
    private #encoder;
    encode(msg: object): Buffer | null;
}
