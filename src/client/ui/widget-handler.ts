import { pid_t, wid_t, WIDGET_TYPE, PANE_TYPE, widget_content_t, page_content_t, page_resource_t, page_property_t, /*WIDGET_STATE,*/ WIDGET_ACTION } from "../../common/types"
import Logger from "../../common/logger"
import { GenID } from "../../common/id-generator"
import MarkdownParser from "../core/markdown-parser"
import CodeExecutor from "../core/custom-widget-executor"
import Editor from "../core/textarea-with-highlight"
import Highlighter from "../core/highlighter"
import Controller from "../controller"
import * as Utils from "./utils"


export interface IHandler {
    readonly uid: string;
    get index(): number;
    Show(): void;
    Destroy(): void;
}
export interface INewPageHandle extends IHandler {
    readonly type: WIDGET_TYPE;
}
export interface IPropertyHandle extends IHandler {
    readonly type: WIDGET_TYPE.PROPERTY;
    readonly id: pid_t;
    SetData(pp: Readonly<page_property_t>): void;
    GetData(): Partial<page_property_t>;
    Render(pp: Readonly<page_property_t>): void;

    ShowAction(showBit: WIDGET_ACTION): void;
    ShowView(): void;
    ShowEditor(): void;
    Toggle(): void;

    UpdateUploadInfo(data: { files: Array<any>, fields: Array<any> }): void;
}
export interface IWidgetHandle {
    readonly id: wid_t;
    readonly type: WIDGET_TYPE;
    GetContent(): Readonly<widget_content_t>;
    SetContent(wc: Readonly<widget_content_t>): void;
    Render(wc: Readonly<widget_content_t>): void;
    ShowAction(showBit: WIDGET_ACTION): void;
    ShowView(): void;
    ShowEditor(): void;
    Toggle(): void;
}
export interface IMarkdownWidgetHandle extends IWidgetHandle, IHandler {
    readonly type: WIDGET_TYPE.MARKDOWN;
}
export interface ICustomWidgetHandle extends IWidgetHandle, IHandler {
    readonly type: WIDGET_TYPE.CUSTOM;
    ShowPane(type: PANE_TYPE): void;
}

export interface HandlerMap {
    [WIDGET_TYPE.PAGE_NEW]: INewPageHandle,
    [WIDGET_TYPE.PROPERTY]: IPropertyHandle,
    [WIDGET_TYPE.MARKDOWN]: IMarkdownWidgetHandle,
    [WIDGET_TYPE.CUSTOM]: ICustomWidgetHandle,
    [WIDGET_TYPE.TEMPLATE]: ICustomWidgetHandle,
}

const SLG_NEW: string = '[slg-new]';
const SLG_TOGGLE: string = '[slg-toggle]';
const SLG_PREVIEW: string = '[slg-preview]';
const SLG_SAVE_TEMPLATE: string = '[slg-save-template]';
const SLG_SAVE: string = '[slg-save]';
const SLG_DELETE: string = '[slg-delete]';

const _e = document.createElement('div');
let _sectionContainer: HTMLElement;

function _ShowAction(actionElem: Element, actionElemMap: Record<string, HTMLElement>, showBit: WIDGET_ACTION): void {
    (showBit & WIDGET_ACTION.NEW) ? actionElem.append(actionElemMap[SLG_NEW]) : actionElemMap[SLG_NEW].remove();
    (showBit & WIDGET_ACTION.TOGGLE) ? actionElem.append(actionElemMap[SLG_TOGGLE]) : actionElemMap[SLG_TOGGLE].remove();
    (showBit & WIDGET_ACTION.PREVIEW) ? actionElem.append(actionElemMap[SLG_PREVIEW]) : actionElemMap[SLG_PREVIEW].remove();
    (showBit & WIDGET_ACTION.SAVE) ? actionElem.append(actionElemMap[SLG_SAVE]) : actionElemMap[SLG_SAVE].remove();
    (showBit & WIDGET_ACTION.DELETE) ? actionElem.append(actionElemMap[SLG_DELETE]) : actionElemMap[SLG_DELETE].remove();
    (showBit & WIDGET_ACTION.SAVE_TEMPLATE) ? actionElem.append(actionElemMap[SLG_SAVE_TEMPLATE]) : actionElemMap[SLG_SAVE_TEMPLATE].remove();
}

function _GetElem(elem: Element) {
    const _viewElem: HTMLElement = Utils.RemoveIfExist(elem.querySelector('[slg-view]'));
    const _editorElem: HTMLElement = Utils.RemoveIfExist(elem.querySelector('[slg-editor]'));
    const _actionElem: HTMLElement = Utils.GetElement(elem, '[slg-action]');
    const _GetActionElem: (s: string) => HTMLElement = Utils.GetElement.bind(undefined, _actionElem);
    const _actionElemMap: Record<string, HTMLElement> = {
        [SLG_NEW]: _GetActionElem(SLG_NEW) ?? _e,
        [SLG_TOGGLE]: _GetActionElem(SLG_TOGGLE) ?? _e,
        [SLG_PREVIEW]: _GetActionElem(SLG_PREVIEW) ?? _e,
        [SLG_SAVE_TEMPLATE]: _GetActionElem(SLG_SAVE_TEMPLATE) ?? _e,
        [SLG_SAVE]: _GetActionElem(SLG_SAVE) ?? _e,
        [SLG_DELETE]: _GetActionElem(SLG_DELETE) ?? _e,
    };
    const _tagCon = Utils.GetElement(_viewElem, '[slg-tags]');
    const _tagElem = Utils.RemoveIfExist(_tagCon.querySelector('[slg-tag]'));
    return { _viewElem, _editorElem, _actionElem, _actionElemMap, _tagCon, _tagElem };
}

function _CreateTags(con: HTMLElement, tpl: HTMLElement, tags: string): void {
    con.innerHTML = '';
    const _tags = tags.split(',');
    if (_tags.length > 0) {
        for (let j = 0, M = _tags.length; j < M; ++j) {
            if (_tags[j] !== '') {
                let _ins = tpl.cloneNode(true) as HTMLElement;
                if (_ins.firstElementChild) {
                    (_ins.firstElementChild as HTMLLinkElement).innerText = _tags[j];
                }
                con.append(_ins);
            }
        }
    }
}

export function CreateNewPageWidget(elem: Element): INewPageHandle {
    const _viewElem: HTMLElement = Utils.GetElement(elem, '[slg-view]');
    let _tmp = Utils.GetElement(_viewElem, '[slg-new-article]');
    _tmp.onclick = _ => {
        Logger.Info('new article');
        Controller.TryAddPage();
    };
    let _tmp2 = Utils.GetElement(_viewElem, '[slg-quick-note]');
    _tmp2.onclick = _ => { Logger.Info('quick note'); };

    const _h: INewPageHandle = {
        index: -1,
        uid: GenID(),
        type: WIDGET_TYPE.PAGE_NEW,
        Show(): void { },
        Destroy(): void {
            elem.remove();
            _tmp.onclick = _tmp2.onclick = null;
        },
    };
    return _h;
}

export function CreatePropertyWidget(pid: pid_t, elem: Element, titleCanClick: boolean, index: number = 0): IPropertyHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap, _tagCon, _tagElem } = _GetElem(elem);
    _actionElem.onclick = e => {
        const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
        if (_aName) {
            Controller.WidgetActionClicked(e, _h, _aName, { x: e.clientX, y: e.clientY });
        }
    }
    //const _uploadBtn: HTMLElement = Utils.GetElement(_editorElem, '[slg-upload]');
    const _resourceContainerElem: HTMLElement = Utils.GetElement(_editorElem, '[slg-resources]');
    const _placeHolderElem: HTMLElement = Utils.RemoveIfExist(_resourceContainerElem.querySelector('[slg-placeholder]'));
    const _resourceElem: HTMLElement = Utils.RemoveIfExist(_resourceContainerElem.querySelector('[slg-resource]'));
    if (titleCanClick) {
        const _a: HTMLElement = Utils.GetElement(_viewElem, '[slg-title]');
        _a.setAttribute('active', '');
        _a.onclick = e => {
            Controller.PageTitleClick(pid);
        }
    } else {
        const _formElem: HTMLFormElement = Utils.GetElement(_editorElem, '[slg-form]') as HTMLFormElement;
        //_formElem.addEventListener('submit', e => { });
        //_formElem.addEventListener("formdata", e => { });
        const _fiesElem: HTMLInputElement = Utils.GetElement(_formElem, '[slg-files]') as HTMLInputElement;
        _fiesElem.addEventListener("change", e => {
            Controller.SubmitResources(_fiesElem);
        });
    }

    const _h: IPropertyHandle = {
        index,
        uid: GenID(),
        id: pid,
        type: WIDGET_TYPE.PROPERTY,
        Show(): void {
            Utils.InsertElementAt(_sectionContainer, elem, index);
        },
        Destroy(): void {
            elem.remove();
            _actionElem.onclick = null;
        },

        ShowView(): void {
            _editorElem.remove();
            _h.ShowAction(WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE);
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _viewElem.remove();
            _h.ShowAction(
                WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE |
                WIDGET_ACTION.SAVE | WIDGET_ACTION.DELETE
            );
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        SetData(pp: Readonly<page_property_t>): void {
            if (pp.id !== pid) return;
            Utils.GetElement(_editorElem, '[slg-title]').textContent = pp.title;
            Utils.GetElement(_editorElem, '[slg-tags]').textContent = pp.tags;
            Utils.GetElement(_editorElem, '[slg-description]').textContent = pp.description;
            _resourceContainerElem.replaceChildren();
            const _N = pp.resources.length;
            if (_N > 0) {
                for (let i = 0; i < _N; ++i) {
                    const _r: page_resource_t = pp.resources[i];
                    const _tmp: HTMLElement = _resourceElem.cloneNode(true) as HTMLElement;
                    Utils.GetElement(_tmp, '[slg-title]').textContent = _r.name;
                    Utils._ELEMENT_FRAGMENT.append(_tmp);
                }
                _resourceContainerElem.append(Utils._ELEMENT_FRAGMENT);
                _resourceContainerElem.onclick = e => {
                    if ((e.target as HTMLElement).tagName === 'BUTTON') {
                        const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
                        if (_aName) {
                            Controller.PageResourceClicked(e, _aName, { x: e.clientX, y: e.clientY });
                        }
                    }
                }
            } else {
                _resourceContainerElem.append(_placeHolderElem);
                _resourceContainerElem.onclick = null;
            }

            _h.Render(pp);
        },
        GetData(): Partial<page_property_t> {
            const _pp: Partial<page_property_t> = {
                id: pid,
                ///createTime: Utils.GetElement(_viewElem, '[slg-time]').textContent ?? '',
                ///author: Utils.GetElement(_viewElem, '[slg-author]').textContent ?? '',
                title: Utils.GetElement(_editorElem, '[slg-title]').textContent ?? '',
                modifyTime: Utils.GetElement(_viewElem, '[slg-time]').textContent ?? '',
                tags: Utils.GetElement(_editorElem, '[slg-tags]').textContent ?? '',
                description: Utils.GetElement(_editorElem, '[slg-description]').textContent ?? '',
            }
            return _pp;
        },
        Render(pp: Readonly<page_property_t>): void {
            Utils.GetElement(_viewElem, '[slg-title]').textContent = pp.title;
            Utils.GetElement(_viewElem, '[slg-time]').textContent = pp.modifyTime;
            Utils.GetElement(_viewElem, '[slg-author]').textContent = pp.author;
            Utils.GetElement(_viewElem, '[slg-description]').textContent = pp.description;
            _CreateTags(_tagCon, _tagElem, pp.tags);
        },

        UpdateUploadInfo(data: { files: Array<any> | any, fields: Array<any> }): void {
            function _CreateLi(file: any): void {
                const _tmp: HTMLElement = _resourceElem.cloneNode(true) as HTMLElement;
                Utils.GetElement(_tmp, '[slg-title]').textContent = file.newFilename;
                Utils._ELEMENT_FRAGMENT.append(_tmp);
            }

            _resourceContainerElem.replaceChildren();
            _resourceContainerElem.onclick = null;
            if (data.files._files instanceof Array) {
                const _N = data.files._files.length;
                if (_N > 0) {
                    for (let i = 0; i < _N; ++i) {
                        _CreateLi(data.files._files[i]);
                    }
                    _resourceContainerElem.onclick = e => {
                        if ((e.target as HTMLElement).tagName === 'BUTTON') {
                            const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
                            if (_aName) {
                                Controller.PageResourceClicked(e, _aName, { x: e.clientX, y: e.clientY });
                            }
                        }
                    }
                } else {
                    Utils._ELEMENT_FRAGMENT.append(_placeHolderElem);
                }
            } else {
                _CreateLi(data.files._files);
            }
            _resourceContainerElem.append(Utils._ELEMENT_FRAGMENT);
        },
    };
    return _h;
}

export function CreateMarkdownWidget(wid: wid_t, elem: Element, index: number = Number.MAX_SAFE_INTEGER): IMarkdownWidgetHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap } = _GetElem(elem);
    const _editor: Editor = new Editor();

    _actionElem.onclick = e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
            if (_aName) {
                Controller.WidgetActionClicked(e, _h, _aName, { x: e.clientX, y: e.clientY });
            }
        }
    }

    const _h: IMarkdownWidgetHandle = {
        index,
        uid: GenID(),
        id: wid,
        type: WIDGET_TYPE.MARKDOWN,
        Show(): void {
            Utils.InsertElementAt(_sectionContainer, elem, index);
        },
        Destroy(): void {
            elem.remove();
            _editor.Destroy();
            _actionElem.onclick = null;
        },

        ShowView(): void {
            _editorElem.remove();
            _h.ShowAction(WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE);
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _editor.Init(Utils.GetElement(_editorElem, "[slg-textarea]"));
            _viewElem.remove();
            _h.ShowAction(
                WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE |
                WIDGET_ACTION.SAVE_TEMPLATE | WIDGET_ACTION.SAVE | WIDGET_ACTION.DELETE
            );
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        GetContent(): Readonly<widget_content_t> {
            const currentValue = _editor.text;
            return {
                id: wid,
                type: WIDGET_TYPE.MARKDOWN,
                data: {
                    content: currentValue,
                    layout: "",
                    action: "",
                }
            }
        },
        SetContent(wc: Readonly<widget_content_t>): void {
            _editor.text = wc.data.content;
            _h.Render(wc);
        },
        Render(wc: Readonly<widget_content_t>): void {
            _viewElem.innerHTML = MarkdownParser.MarkdownStringToHTML(wc.data.content);
            Highlighter.AutoHighlight(_viewElem);
        }
    };
    return _h;
}

export function CreateCustomWidget(wid: wid_t, elem: Element, index: number = Number.MAX_SAFE_INTEGER): ICustomWidgetHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap } = _GetElem(elem);
    const _buttonsElem: HTMLElement = Utils.GetElement(_editorElem, '[slg-buttons]');
    const _textareasElem: HTMLElement = Utils.GetElement(_editorElem, '[slg-textareas]');
    const _editor: Editor = new Editor('json');
    const _editor2: Editor = new Editor('html');
    const _editor3: Editor = new Editor('javascript');
    let _lastShownPaneType: PANE_TYPE = PANE_TYPE.UNKNOWN;

    _actionElem.onclick = e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
            if (_aName) {
                Controller.WidgetActionClicked(e, _h, _aName, { x: e.clientX, y: e.clientY });
            }
        }
    }

    _buttonsElem.onmousedown = e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            const _pType = (e.target as HTMLElement).dataset['slgButton'] as PANE_TYPE;
            if (_pType) {
                _h.ShowPane(_pType);
            }
        }
    }

    const _h: ICustomWidgetHandle = {
        index,
        uid: GenID(),
        id: wid,
        type: WIDGET_TYPE.CUSTOM,
        Show(): void {
            Utils.InsertElementAt(_sectionContainer, elem, index);
        },
        Destroy(): void {
            elem.remove();
            _editor.Destroy();
            _editor2.Destroy();
            _editor3.Destroy();
            _buttonsElem.onmousedown = null;
            _actionElem.onclick = null;
        },

        ShowView(): void {
            _editorElem.remove();
            _h.ShowAction(WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE);
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _editor.Init(Utils.GetElement(_textareasElem, "[slg-textarea-content]"));
            _editor2.Init(Utils.GetElement(_textareasElem, "[slg-textarea-layout]"));
            _editor3.Init(Utils.GetElement(_textareasElem, "[slg-textarea-action]"));
            _viewElem.remove();
            _h.ShowAction(
                WIDGET_ACTION.NEW | WIDGET_ACTION.TOGGLE |
                WIDGET_ACTION.SAVE_TEMPLATE | WIDGET_ACTION.SAVE | WIDGET_ACTION.DELETE
            );
            if (_lastShownPaneType === PANE_TYPE.UNKNOWN) {
                let _type = PANE_TYPE.UNKNOWN;
                if (_editor.text) {
                    _type = PANE_TYPE.CONTENT;
                } else if (_editor2.text) {
                    _type = PANE_TYPE.LAYOUT;
                } else if (_editor3.text) {
                    _type = PANE_TYPE.ACTION;
                }
                _h.ShowPane(_type);
            }
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        GetContent(): Readonly<widget_content_t> {
            return {
                id: wid,
                type: WIDGET_TYPE.CUSTOM,
                data: {
                    content: _editor.text,
                    layout: _editor2.text,
                    action: _editor3.text,
                }
            }
        },
        SetContent(wc: Readonly<widget_content_t>): void {
            _editor.text = wc.data.content;
            _editor2.text = wc.data.layout;
            _editor3.text = wc.data.action;
            CodeExecutor(_viewElem, wc);
        },
        ShowPane(type: PANE_TYPE): void {
            if (type === PANE_TYPE.UNKNOWN) return;
            _lastShownPaneType = type;

            Array.from(_textareasElem.children).forEach(e => {
                e.removeAttribute("active");
            });
            Array.from(_buttonsElem.children).forEach(e => {
                e.removeAttribute("active");
            });
            let _tmp2 = _textareasElem.querySelector(`[slg-textarea-${type}]`);
            if (_tmp2) _tmp2.setAttribute("active", "");
            _tmp2 = _buttonsElem.querySelector(`[slg-button-${type}]`);
            if (_tmp2) _tmp2.setAttribute("active", "");
        },

        Render(wc: Readonly<widget_content_t>): void {
            CodeExecutor(_viewElem, wc);
            Highlighter.AutoHighlight(_viewElem);
        }
    };
    return _h;
}

export function Init(TPL: Element): void {
    _sectionContainer = TPL.querySelector('[slg-section-container]') as HTMLElement;
}
