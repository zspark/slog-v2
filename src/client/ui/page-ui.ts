import { pid_t, wid_t, WIDGET_TYPE, PANE_TYPE, widget_content_t, page_content_t, page_property_t, /*WIDGET_STATE,*/ WIDGET_ACTION } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import {
    IMarkdownWidgetHandle,
    IPropertyHandle,
    INewPageHandle,
    IHandler,
    ICustomWidgetHandle,
    CreateCustomWidget,
    CreateNewPageWidget,
    CreateMarkdownWidget,
    CreatePropertyWidget,
} from "./widget-handler"
import * as Utils from "./utils"
import { IPageUi } from "./ui-type"

const _e = document.createElement('div');
const _mapWidgetTemplate = new Map<WIDGET_TYPE, Element>();
function _DoInstantiation(type: WIDGET_TYPE): Element {
    const _tpl: Element = _mapWidgetTemplate.get(type) ?? _e;
    return _tpl.cloneNode(true) as HTMLElement;
}

export default class PageUi implements IPageUi {
    //private _newPageWidget: INewPageHandle;
    private _mapWidgetHandle = new Map<wid_t, IHandler>();
    private _propertyWidget: IPropertyHandle | undefined;

    constructor() {
        CreateNewPageWidget(_mapWidgetTemplate.get(WIDGET_TYPE.PAGE_NEW) ?? _e);

        Model.Subscribe('pagelist-fetch-event', (evt) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    this._DestroyHandle();
                    break;
                case EventPhase.RESPOND:
                    {
                        const _arr = evt.arrPageProperty as Array<page_property_t>;
                        for (let i = 0, N = _arr.length; i < N; ++i) {
                            const _pp: page_property_t = _arr[i];
                            const _h: IPropertyHandle = CreatePropertyWidget(_pp.id, _DoInstantiation(WIDGET_TYPE.PROPERTY), true, i);
                            this._mapWidgetHandle.set(_pp.id, _h);
                            _h.SetData(_pp);
                            _h.ShowView();
                            _h.Show();
                            _h.ShowAction(WIDGET_ACTION.NONE);
                        }
                    }
                    break;
            }
        });
        Model.Subscribe('page-fetch-event', (evt) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    this._DestroyHandle();
                    break;
                case EventPhase.RESPOND:
                    {
                        let _index: number = 0;
                        const _property = evt.property as page_property_t;
                        this._propertyWidget = CreatePropertyWidget(_property.id, _DoInstantiation(WIDGET_TYPE.PROPERTY), false, _index++);
                        this._mapWidgetHandle.set(_property.id, this._propertyWidget);
                        this._propertyWidget.SetData(_property);
                        this._propertyWidget.ShowView();
                        this._propertyWidget.Show();


                        const _content = evt.content as page_content_t;
                        for (let i = 0, N = _content.indexes.length; i < N; ++i) {
                            const id: wid_t = _content.indexes[i];
                            const _wc: widget_content_t = _content.sections[id];
                            let _h: IHandler | undefined;
                            switch (_wc.type) {
                                case WIDGET_TYPE.MARKDOWN:
                                    _h = CreateMarkdownWidget(_wc.id, _DoInstantiation(WIDGET_TYPE.MARKDOWN), _index++);
                                    (_h as IMarkdownWidgetHandle).SetContent(_wc);
                                    (_h as IMarkdownWidgetHandle).ShowView();
                                    break;
                                case WIDGET_TYPE.CUSTOM:
                                    _h = CreateCustomWidget(_wc.id, _DoInstantiation(WIDGET_TYPE.CUSTOM), _index++);
                                    (_h as ICustomWidgetHandle).SetContent(_wc);
                                    (_h as ICustomWidgetHandle).ShowView();
                                    //CodeExecutor(_h.viewElement, _wc.data as widget_content_t);
                                    break;
                                case WIDGET_TYPE.TEMPLATE:
                                    //_h = _CreateTemplateWidget(_wc);
                                    break;
                                case WIDGET_TYPE.PROPERTY:
                                    //_h = CreatePropertyWidget(_wc.data as widget_content_t);
                                    break;
                                case WIDGET_TYPE.PAGE_NEW:
                                default:
                                    Logger.Error(`no way to get here, should be internal error somewhere`);
                            }

                            if (_h) {
                                this._mapWidgetHandle.set(id, _h);
                                _h.Show();
                            }

                        }
                    }
                    break;
            }
        });

        Model.Subscribe('page-add-event', (evt) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    this._DestroyHandle();
                    break;
                case EventPhase.RESPOND:
                    {
                        if (!evt.pageProperty) return;
                        const _pp = evt.pageProperty;
                        const _h: IPropertyHandle = CreatePropertyWidget(_pp.id, _DoInstantiation(WIDGET_TYPE.PROPERTY), false, 0);
                        this._mapWidgetHandle.set(_pp.id, _h);
                        _h.ShowEditor();
                        _h.Show();
                    }
                    break;
            }
        });

        Model.Subscribe('page-update-event', (evt) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    {
                        const _h = this._mapWidgetHandle.get(evt.pageProperty.id);
                        if (_h) {
                            (_h as IPropertyHandle).SetData(evt.pageProperty);
                            //if (!evt.pageProperty) return;
                            //const _pp = evt.pageProperty;
                            //const _h: IHandler = this._mapWidgetHandle.get(_pp.id);
                            //let _h2 = _h as IPropertyHandle;
                            //_h2.ShowEditor();
                            //_h2.Show();
                        }
                    }
                    break;
            }
        });

        Model.Subscribe('page-delete-event', (evt) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    {
                        const _h = this._mapWidgetHandle.get(evt.id);
                        if (_h) {
                            this._mapWidgetHandle.delete(evt.id);
                            _h.Destroy();
                        }
                    }
                    break;
            }
        });

        Model.Subscribe('widget-add-event', (evt: ModelEventMap['widget-add-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    {
                        let _h: IHandler | undefined;
                        const _wc: widget_content_t = evt.data as widget_content_t;
                        switch (_wc.type) {
                            case WIDGET_TYPE.CUSTOM:
                                _h = CreateCustomWidget(_wc.id, _DoInstantiation(WIDGET_TYPE.CUSTOM), evt.index);
                                (_h as ICustomWidgetHandle).SetContent(_wc);
                                (_h as ICustomWidgetHandle).ShowEditor();
                                break;
                            case WIDGET_TYPE.MARKDOWN:
                            default:
                                _h = CreateMarkdownWidget(_wc.id, _DoInstantiation(WIDGET_TYPE.MARKDOWN), evt.index);
                                (_h as IMarkdownWidgetHandle).SetContent(_wc);
                                (_h as IMarkdownWidgetHandle).ShowEditor();
                                break;
                        }
                        if (_h) {
                            this._mapWidgetHandle.set(_wc.id, _h);
                            _h.Show();
                        }
                    }
                    break;
            }
        });

        Model.Subscribe('widget-update-event', (evt: ModelEventMap['widget-update-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    {
                        const _wc: widget_content_t = evt.data as widget_content_t;
                        let _h = this._mapWidgetHandle.get(_wc.id);
                        if (_h) {
                            (_h as IMarkdownWidgetHandle).SetContent(_wc);
                        }
                    }
                    break;
            }
        });

        Model.Subscribe('widget-delete-event', (evt: ModelEventMap['widget-delete-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    {
                        let _h = this._mapWidgetHandle.get(evt.wid);
                        if (_h) {
                            _h.Destroy();
                        }
                    }
                    break;
            }
        });

        Model.Subscribe('upload-finished-event', (evt) => {
            if (this._propertyWidget) {
                if (evt.data.code > 0) {
                    this._propertyWidget.UpdateUploadInfo(evt.data.data);
                } else {
                    Logger.Info(`alert to show error message`);
                }
            }
        });
    }

    private _DestroyHandle(excludes?: Array<pid_t | wid_t>): void {
        if (excludes) {
            excludes.forEach(id => {
                const _v = this._mapWidgetHandle.get(id);
                if (_v) {
                    this._mapWidgetHandle.delete(id);
                }
            });
        }
        this._mapWidgetHandle.forEach(h => {
            h.Destroy();
        });
        this._mapWidgetHandle.clear();
        this._propertyWidget = undefined;
    }


    static Init(TPL: Element): void {
        let _InitFn: Function = () => {
            let _value: Element | null;
            _value = Utils.GetElement(TPL, 'div[slg-widget-page-new]');
            if (_value) {
                _mapWidgetTemplate.set(WIDGET_TYPE.PAGE_NEW, _value);
            }

            _value = Utils.GetAndRemoveElement(TPL, 'section[slg-widget-property]');
            if (_value) {
                Utils.RemoveContentIfExist(_value.querySelector('[slg-introduction]'));
                _mapWidgetTemplate.set(WIDGET_TYPE.PROPERTY, _value);
            }

            _value = Utils.GetAndRemoveElement(TPL, 'section[slg-widget-markdown]');
            if (_value) {
                Utils.RemoveContentIfExist(_value.querySelector('[slg-view]'));
                _mapWidgetTemplate.set(WIDGET_TYPE.MARKDOWN, _value);
            }

            _value = Utils.GetAndRemoveElement(TPL, 'section[slg-widget-custom]');
            if (_value) {
                _mapWidgetTemplate.set(WIDGET_TYPE.CUSTOM, _value);
            }

            _InitFn = () => {
                Logger.Error(`Init function of PageUi should always been invoked once.`);
            };
        }
        _InitFn();
    }
}

