export namespace inquirer {
    export { confirm };
    export { select };
}
export function handleInquirerError(e: object): never;
export function getBrowserData(key: string): object;
export function getConfigDir(opt?: object): string;
export class Setup {
    constructor(opt?: {
        browser?: string | undefined;
        configPath?: string | undefined;
        hostDescription?: string | undefined;
        hostName?: string | undefined;
        mainScriptFile?: string | undefined;
        chromeExtensionIds?: string[] | undefined;
        webExtensionIds?: string[] | undefined;
        supportedBrowsers?: string[] | undefined;
        callback?: Function | undefined;
        overwriteConfig?: boolean | undefined;
    });
    set browser(browser: any);
    get browser(): any;
    set supportedBrowsers(arr: string[]);
    get supportedBrowsers(): string[];
    set configPath(dir: string);
    get configPath(): string;
    set hostDescription(desc: string | null | undefined);
    get hostDescription(): string | null | undefined;
    set hostName(name: string | null | undefined);
    get hostName(): string | null | undefined;
    set mainScriptFile(name: string | undefined);
    get mainScriptFile(): string | undefined;
    set chromeExtensionIds(arr: string[] | null);
    get chromeExtensionIds(): string[] | null;
    set webExtensionIds(arr: string[] | null);
    get webExtensionIds(): string[] | null;
    set callback(func: Function | null);
    get callback(): Function | null;
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
    run(): Promise<object>;
    #private;
}
import { confirm } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
