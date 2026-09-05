import { Separator } from '@inquirer/prompts';
export declare const inquirer: {
    confirm: import("@inquirer/type").Prompt<boolean, {
        message: string;
        default?: boolean | undefined | undefined;
        transformer?: ((value: boolean) => string) | undefined;
        theme?: import("@inquirer/type").PartialDeep<import("@inquirer/core").Theme<{
            keywords: {
                yes: string;
                no: string;
            };
            style: {
                confirmDefault: (text: string) => string;
            };
        }>> | undefined;
    } & {
        message: string;
        default?: boolean | undefined;
        transformer?: (value: boolean) => string;
        theme?: import("@inquirer/type").PartialDeep<import("@inquirer/core").Theme<{
            keywords: {
                yes: string;
                no: string;
            };
            style: {
                confirmDefault: (text: string) => string;
            };
        }>>;
    }>;
    select: <const Value>(config: {
        message: string;
        choices: readonly (Separator | Value | {
            value: Value;
            name?: string;
            description?: string;
            short?: string;
            disabled?: boolean | string;
            type?: never;
        })[];
        pageSize?: number | undefined;
        loop?: boolean | undefined;
        default?: NoInfer<Value> | undefined;
        theme?: import("@inquirer/type").PartialDeep<import("@inquirer/core").Theme<{
            icon: {
                cursor: string;
            };
            style: {
                disabled: (text: string) => string;
                description: (text: string) => string;
                keysHelpTip: (keys: [key: string, action: string][]) => string | undefined;
            };
            i18n: {
                disabledError: string;
            };
            indexMode: 'hidden' | 'number';
        }>> | undefined;
    } & {
        message: string;
        choices: readonly (Value | {
            value: Value;
            name?: string;
            description?: string;
            short?: string;
            disabled?: boolean | string;
            type?: never;
        } | Separator)[];
        pageSize?: number;
        loop?: boolean;
        default?: NoInfer<Value> | undefined;
        theme?: import("@inquirer/type").PartialDeep<import("@inquirer/core").Theme<{
            icon: {
                cursor: string;
            };
            style: {
                disabled: (text: string) => string;
                description: (text: string) => string;
                keysHelpTip: (keys: [key: string, action: string][]) => string | undefined;
            };
            i18n: {
                disabledError: string;
            };
            indexMode: 'hidden' | 'number';
        }>>;
    }, context?: import("@inquirer/type").Context) => Promise<Value>;
};
export declare const handleInquirerError: (e: object) => never;
export declare const getBrowserData: (key: string) => object;
export declare const getConfigDir: (opt?: object) => string;
export declare class Setup {
    #private;
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
    get browser(): any;
    set browser(browser: any);
    get supportedBrowsers(): string[];
    set supportedBrowsers(arr: string[]);
    get configPath(): string;
    set configPath(dir: string);
    get hostDescription(): string | null | undefined;
    set hostDescription(desc: string | null | undefined);
    get hostName(): string | null | undefined;
    set hostName(name: string | null | undefined);
    get mainScriptFile(): string | undefined;
    set mainScriptFile(name: string | undefined);
    get chromeExtensionIds(): string[] | null;
    set chromeExtensionIds(arr: string[] | null);
    get webExtensionIds(): string[] | null;
    set webExtensionIds(arr: string[] | null);
    get callback(): Function | null;
    set callback(func: Function | null);
    get overwriteConfig(): boolean;
    set overwriteConfig(overwrite: boolean);
    private _getBrowserConfigDir;
    private _createReg;
    private _createManifest;
    private _createShellScript;
    private _createConfigDir;
    private _createFiles;
    private _handleBrowserConfigDir;
    private _handleBrowserInput;
    run(): Promise<object>;
}
