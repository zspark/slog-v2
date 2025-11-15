import DynamicImport from "../common/dynamic-import";
import Logger from "../common/logger";
import ServerProxy from "./core/server-proxy"
import { LoadScriptWithHTMLScriptTag, GetElementExt } from "./ui/utils"

type windowWithMd5 = Window & typeof globalThis & { MD5: Function };

const _con: HTMLElement = document.querySelector('[before-loaded]') as HTMLElement;
const _loading: HTMLElement = _con.querySelector('[slg-loading]') as HTMLElement;
const _debugOn = true;
const _uiFilePath: string = "../ui/";
const _arrPromise: Promise<any>[] = [];
_arrPromise.push(DynamicImport(_debugOn ? `${_uiFilePath}main.ui.js` : `${_uiFilePath}main.ui.js`));
_arrPromise.push(DynamicImport(_debugOn ? `./main.bundle.js` : `./main.bundle.min.js`));

//http://wwww.your-domain.com?cmd=login|editmode
const _URL = new URL(window.location.href);
const _cmds = _URL.searchParams.get("cmd");
if (_cmds) {
    const arrCmd: Array<string> = _cmds.split('|');
    if (arrCmd.includes('login')) {
        const _arr: Array<Promise<any>> = [];
        _arr.push(LoadScriptWithHTMLScriptTag('./lib/md5/md5.min.js'));
        _arr.push(DynamicImport(_debugOn ? `${_uiFilePath}login.ui.js` : `${_uiFilePath}login.ui.js`));
        Promise.all(_arr).then(arrModel => {
            const _doc = new DOMParser().parseFromString(arrModel[1].default, 'text/html');
            const _targetElem: HTMLElement | null = _doc.querySelector("body [slg-login]");
            if (_targetElem) {
                _con.append(_targetElem);
                const _button: HTMLButtonElement = _targetElem.querySelector('[slg-login-button]') as HTMLButtonElement;
                _button.onclick = e => {
                    const _r: boolean = GetElementExt<HTMLInputElement>(_targetElem, "input[name='rem']")?.checked ?? false;
                    const _a: string = GetElementExt<HTMLInputElement>(_targetElem, "input[name='account']")?.value ?? '';
                    const _p: string = GetElementExt<HTMLInputElement>(_targetElem, "input[name='pwd']")?.value ?? '';
                    ServerProxy.Login(_a, (window as windowWithMd5).MD5(_p)).then(_ => {
                        Logger.Info('login successfully');
                        _Start({
                            arrCmd,
                            editorMode: true,
                        });
                    }, _ => { }).finally(() => {
                        _button.onclick = null;
                    });
                }
                _loading.remove();
            }
        });
    }
} else {
    _Start({
        editorMode: false,
    });
}

function _Start(option?: any) {
    Promise.all(_arrPromise).then((arrData) => {
        const _doc2 = new DOMParser().parseFromString(arrData[0].default, 'text/html');
        const Application: any = arrData[1].default;
        new Application(_doc2.body, option);

        const _arrElem: Array<Node> = [];
        _doc2.body.childNodes.forEach(n => {
            _arrElem.push(n);
        });
        document.body.replaceChildren(..._arrElem);

    });
}

