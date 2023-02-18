export class Input {
    decode(chunk: string | Buffer): any[] | null;
    #private;
}
export class Output {
    encode(msg: object): Buffer;
    #private;
}
