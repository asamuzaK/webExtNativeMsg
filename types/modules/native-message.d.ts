export class Input {
    decode(chunk: string | Buffer): Array<string> | null;
    #private;
}
export class Output {
    encode(msg: object): Buffer | null;
    #private;
}
