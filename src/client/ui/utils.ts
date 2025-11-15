import { pid_t, wid_t } from "../../common/types"
import Logger from "../../common/logger"
import DelayPromise from "../../common/delay-promise"
import { screen_pos_t, screen_size_t } from "../core/types"
//import { color_t, IColorLikeObject, IColorLikeArray } from "../common/api-ui"

export type InitFunc = (d: Document) => Function;

export function Get<T>(e: Element | null, qString: string): T | null {
    if (e) {
        const _e: Element | null = e.querySelector(qString);
        return _e ? _e as T : null;
    }
    return null;
}
export function SetInputValue(target: HTMLInputElement | null, value: string | boolean): void {
    if (!target) return;
    const _type: string | null = target.getAttribute("type");
    if (_type) {
        switch (_type) {
            case "text":
                target.value = <string>value;
                break;
            case "date":
                //target.value = (<object>value).toJSON().slice(0, 10);
                break;
            case "checkbox":
                target.checked = <boolean>value;
                break;
            default:
                console.warn(`no such type:${_type}`);
        }
    }
}

export function GetInputValue(target: HTMLInputElement | null): string | boolean | undefined {
    if (!target) return undefined;
    const _type = target.getAttribute("type");
    if (_type) {
        switch (_type) {
            case "text":
            case "date":
            case "search":
                return target.value;
            case "checkbox":
                return target.checked;
            default:
                console.warn(`no such type:${_type}`);
                return undefined;
        }
    }
    return undefined;
}

export function GetTemplate(mainUI: Document, qString: string): HTMLTemplateElement | null {
    const _elem: Element | null = mainUI.querySelector(qString);
    if (!_elem) {
        console.warn(`[SLOG] no such template: ${qString}`);
        return null;
    }
    return <HTMLTemplateElement>_elem;
}

export function InstantiateTemplate<T>(tpl: HTMLTemplateElement, clone: boolean = true, index: number = 0): T | null {
    if (index < 0 || index >= tpl.content.childElementCount) {
        console.warn(`[SLOG] no such child element at index: ${index}`);
        return null;
    }
    let _elem: Element = <Element>tpl.content.children.item(index);
    return <T>(clone ? _elem.cloneNode(true) : _elem);
}

export function AddStyle(elem: HTMLElement, key: string, value: string): void {
    elem.style.setProperty(key, value);
}
export function RemoveStyle(elem: HTMLElement, key: string): void {
    elem.style.removeProperty(key);
}

export const _ELEMENT_FRAGMENT: DocumentFragment = document.createDocumentFragment();

export function SetInnerText(elem: HTMLElement, qString: string, text: string): void {
    const _e: Element | null = elem.querySelector(qString);
    if (_e) (<HTMLElement>_e).innerText = text;
}

export function SetInnerHTML(elem: HTMLElement, qString: string, html: string): void {
    const _e: Element | null = elem.querySelector(qString);
    if (_e) (<HTMLElement>_e).innerHTML = html;
}

export function SetImgSrc(elem: HTMLElement, qString: string, value: string): void {
    const _e: Element | null = elem.querySelector(qString);
    if (_e) (<HTMLImageElement>_e).src = value;
}

export function SetLinkHref(elem: HTMLElement, qString: string, value: string): void {
    const _e: Element | null = elem.querySelector(qString);
    if (_e) (<HTMLLinkElement>_e)['href'] = value;
}

/*
export function Color2CSSString(color: color_t): string {
    let _ret: string;
    if (IsArray(color)) {
        const _t: IColorLikeArray = <IColorLikeArray>color;
        _ret = `#${_t[0].toString(16)}${_t[1].toString(16)}${_t[2].toString(16)}`;
        if (_t[3]) _ret += `${_t[3].toString(16)}`;
    } else if (IsObject(color)) {
        const _t: IColorLikeObject = <IColorLikeObject>color;
        _ret = `#${_t.r.toString(16)}${_t.g.toString(16)}${_t.b.toString(16)}`;
        if (_t.a) _ret += `${_t.a.toString(16)}`;
    } else {
        _ret = <string>color;
        if (_ret.indexOf('#') !== 0) _ret = `#${_ret}`;
    }
    return _ret;
}
*/

export function GetAndRemoveElement(TPL: Element, queryString: string): Element | null {
    const _tmp = TPL.querySelector(queryString);
    if (!_tmp) {
        Logger.Error(`template did NOT found: ${queryString}.`);
        return null;
    }
    _tmp.remove();
    return _tmp;
}

export function LoadScriptWithHTMLScriptTag(url: string): DelayPromise<boolean>['promise'] {
    const _dp: DelayPromise<boolean> = new DelayPromise<boolean>();
    const _s: HTMLScriptElement = document.createElement('script');
    _s.src = url;
    _s.onload = e => {
        _dp.Resolve(true);
    }
    document.head.append(_s);
    return _dp.promise;
}

const _PADDING_SIZE: screen_size_t = { w: 30, h: 30 };
export function CalcuDropdowPos(target: HTMLElement, refPos: screen_pos_t): screen_pos_t {
    /// append in order to fetch its size;
    window.document.body.append(target);
    const _size: screen_size_t = { w: target.offsetWidth, h: target.offsetHeight };
    const _clientSZ: screen_size_t = { w: window.document.body.clientWidth - _PADDING_SIZE.w, h: window.document.body.clientHeight - _PADDING_SIZE.h };
    const _out: screen_pos_t = { x: refPos.x, y: refPos.y };

    let _deltaX = _clientSZ.w - _size.w;
    if (_deltaX < 0) {
        /// target larger than window;
        _out.x += _deltaX * 0.5;
    } else {
        let _right: number = refPos.x + _size.w;
        _deltaX = _clientSZ.w - _right;
        if (_deltaX < 0) {
            _out.x += _deltaX;
        }
    }

    let _deltaY = _clientSZ.h - _size.h;
    if (_deltaY < 0) {
        /// target larger than window;
        _out.y += _deltaY * 0.5;
    } else {
        let _bottom: number = refPos.y + _size.h;
        _deltaY = _clientSZ.h - _bottom;
        if (_deltaY < 0) {
            _out.y += _deltaY;
        }
    }

    return _out;
}

const _e = document.createElement('div');
export function RemoveContentIfExist(elem: Element | null): void {
    if (elem) elem.innerHTML = "";
}
export function RemoveIfExist(elem: HTMLElement | null): HTMLElement {
    if (elem) elem.remove();
    return elem ?? _e;
}

export function GetElement(elem: Element | undefined, qString: string): HTMLElement {
    if (elem) return elem.querySelector(qString) ?? _e;
    return _e;
}
export function GetElementExt<T = HTMLElement>(elem: Element | null | undefined, qString: string): T | null {
    if (elem) {
        const _e = elem.querySelector(qString);
        return _e ? _e as T : null;
    }
    return null;
}
export function GetElements(elem: Element | undefined, qString: string): Array<Element> {
    if (elem) return Array.from(elem.querySelectorAll(qString));
    return [];
}

export function InsertElementAt(parentElem: Element | undefined, elem: Element | undefined, index: number): void {
    if (elem && parentElem) {
        const _count: number = parentElem.childElementCount;
        index = Math.max(0, Math.min(_count, index));
        if (_count === index) {
            parentElem.append(elem);
        } else if (_count === 0) {
            parentElem.prepend(elem);
        } else {
            let _pivotElem = parentElem.children[index];
            _pivotElem.before(elem);
        }
    }
}


