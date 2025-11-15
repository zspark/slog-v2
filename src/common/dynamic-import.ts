import Logger from "./logger";
export default function DynamicImport(url: string): Promise<any> {
    return import(url).then((module: any): any => {
        return module;
    }, (reason) => {
        Logger.Error(`can NOT load file dynamically: ${url}
reason:${reason.toString()}`);
        return null;
    });
}
