export namespace inquirer {
    export { confirm };
    export { select };
}
export const values: Map<any, any>;
export function abortSetup(msg: string, code?: number): void;
export function handleInquirerError(e: object): Function;
export function handleSetupCallback(): Function | null;
export function handleRegClose(code: number): Function | null;
export function handleRegStderr(data: any): void;
export function getBrowserData(key: string): object;
export function getConfigDir(opt?: object): string;
export class Setup {
    constructor(opt?: {
        browser?: string;
        configPath?: string;
        hostDescription?: string;
        hostName?: string;
        mainScriptFile?: string;
        chromeExtensionIds?: Array<string>;
        webExtensionIds?: Array<string>;
        supportedBrowsers?: Array<string>;
        callback?: Function;
        overwriteConfig?: boolean;
    });
    set browser(browser: any);
    get browser(): any;
    set supportedBrowsers(arr: string[]);
    get supportedBrowsers(): string[];
    set configPath(dir: string);
    get configPath(): string;
    set hostDescription(desc: string);
    get hostDescription(): string;
    set hostName(name: string);
    get hostName(): string;
    set mainScriptFile(name: string);
    get mainScriptFile(): string;
    set chromeExtensionIds(arr: string[]);
    get chromeExtensionIds(): string[];
    set webExtensionIds(arr: string[]);
    get webExtensionIds(): string[];
    set callback(func: Function);
    get callback(): Function;
    set overwriteConfig(overwrite: boolean);
    get overwriteConfig(): boolean;
    private _getBrowserConfigDir;
    private _createReg;
    private _createManifest;
    private _createShellScript;
    private _createConfigDir;
    private _createFiles;
    private _handleBrowserConfigDir;
    private _handleBrowserInput;
    run(): Promise<any>;
    #private;
}
import { confirm } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
