import { pid_t, wid_t, page_content_t, template_content_t, widget_content_t, page_property_t, WIDGET_TYPE, PANE_TYPE, WIDGET_ACTION } from "../common/types"
import Logger from "../common/logger"
import { screen_pos_t, screen_size_t } from "./core/types"
import { EventPhase, event_feedback_t } from "./core/event-types"
import { INavUi, IMenuUi, ITemplateUi } from "./ui/ui-type"
import Model, { ModelEventMap } from "./model"
//import * as Utils from "./utils"
//import MarkdownParser from "./core/markdown-parser"
//import CodeExecutor from "./core/custom-widget-executor"

import {
    IHandler,
    IPropertyHandle,
    IMarkdownWidgetHandle,
    ICustomWidgetHandle
} from "./ui/widget-handler"

function TryFetchPage(pid: pid_t): void {
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('page-fetch-event', { phase: EventPhase.BEFORE_REQUEST, feedback, id: pid });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.FetchPage(pid);
    Model.Dispatch('page-fetch-event', { phase: EventPhase.AFTER_REQUEST, id: pid });

}

function TryAddPage(): void {
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('page-add-event', { phase: EventPhase.BEFORE_REQUEST, feedback });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.AddPage();
    Model.Dispatch('page-add-event', { phase: EventPhase.AFTER_REQUEST });
}
function TryDeleteWidget(wid: wid_t): void {
    const pid = Model.GetPidOfWidBelongs(wid);
    if (!pid) return;
    const feedback: event_feedback_t = { ok: true };
    const _tmp: ModelEventMap['widget-delete-event'] = { phase: EventPhase.UNKNOWN, feedback, pid, wid };
    _tmp.phase = EventPhase.BEFORE_REQUEST;
    Model.Dispatch('widget-delete-event', _tmp);
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.DeleteWidget(pid, wid);
    _tmp.phase = EventPhase.AFTER_REQUEST;
    Model.Dispatch('widget-delete-event', _tmp);
}
function TryDeletePage(id: pid_t): void {
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('page-delete-event', { phase: EventPhase.BEFORE_REQUEST, feedback, id });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.DeletePage(id);
    Model.Dispatch('page-delete-event', { phase: EventPhase.AFTER_REQUEST, id });
}

const _newFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (pos: screen_pos_t, handler: IPropertyHandle) => {
        Model.Dispatch('menu-display-event', { phase: EventPhase.RESPOND, pos, pid: handler.id, index: handler.index });
    },
    [WIDGET_TYPE.MARKDOWN]: (pos: screen_pos_t, handler: IMarkdownWidgetHandle) => {
        const pid = Model.GetPidOfWidBelongs(handler.id);
        if (pid) {
            Model.Dispatch('menu-display-event', { phase: EventPhase.RESPOND, pos, pid, wid: handler.id, index: handler.index });
        }
    },
    [WIDGET_TYPE.CUSTOM]: (pos: screen_pos_t, handler: ICustomWidgetHandle) => {
        const pid = Model.GetPidOfWidBelongs(handler.id);
        if (pid) {
            Model.Dispatch('menu-display-event', { phase: EventPhase.RESPOND, pos, pid, wid: handler.id, index: handler.index });
        }
    },
    [WIDGET_TYPE.TEMPLATE]: (_: IHandler) => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
}
const _saveFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (handler: IPropertyHandle) => { TryUpdatePageProperty(handler.GetData()); },
    [WIDGET_TYPE.MARKDOWN]: (handler: IMarkdownWidgetHandle) => { TryUpdateWidget(handler.GetContent()); },
    [WIDGET_TYPE.CUSTOM]: (handler: ICustomWidgetHandle) => { TryUpdateWidget(handler.GetContent()); },
    [WIDGET_TYPE.TEMPLATE]: (h: IHandler) => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
}
const _deleteFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (pos: screen_pos_t, handler: IPropertyHandle) => {
        Model.Dispatch('alert-display-event', {
            phase: EventPhase.RESPOND, pos, msg: "are you sure to delete this widget?",
            yesFunc: (_: void) => {
                TryDeletePage(handler.id);
            }
        });
    },
    [WIDGET_TYPE.MARKDOWN]: (pos: screen_pos_t, handler: IMarkdownWidgetHandle) => {
        Model.Dispatch('alert-display-event', {
            phase: EventPhase.RESPOND, pos, msg: "are you sure to delete this widget?",
            yesFunc: (_: void) => {
                TryDeleteWidget(handler.id);
            }
        });
    },
    [WIDGET_TYPE.CUSTOM]: (pos: screen_pos_t, handler: ICustomWidgetHandle) => {
        Model.Dispatch('alert-display-event', {
            phase: EventPhase.RESPOND, pos, msg: "are you sure to delete this widget?",
            yesFunc: (_: void) => {
                //pid, wid: handler.id
                TryDeleteWidget(handler.id);
            }
        });
    },
    [WIDGET_TYPE.TEMPLATE]: (_: IHandler) => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
}
const _templateFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (pos: screen_pos_t, handler: IPropertyHandle) => { },
    [WIDGET_TYPE.MARKDOWN]: (pos: screen_pos_t, handler: IMarkdownWidgetHandle) => { },
    [WIDGET_TYPE.CUSTOM]: (pos: screen_pos_t, handler: ICustomWidgetHandle) => {
        const pid = Model.GetPidOfWidBelongs(handler.id);
        if (pid) {
            Model.Dispatch('template-display-event', { phase: EventPhase.RESPOND, pos, pid, widgetContent: handler.GetContent() });
        }
    },
    [WIDGET_TYPE.TEMPLATE]: (_: IHandler) => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
}
function WidgetActionClicked(e: MouseEvent, handler: IPropertyHandle | IMarkdownWidgetHandle | ICustomWidgetHandle, menuName: string, pos: screen_pos_t): void {
    switch (menuName) {
        case "new":
            _newFunc[handler.type](pos, handler);
            break;
        case "toggle":
            handler.Toggle();
            break;
        case "preview":
            handler.ShowView();
            break;
        case "save":
            _saveFunc[handler.type](handler);
            break;
        case "delete":
            _deleteFunc[handler.type](pos, handler);
            break;
        case "template":
            _templateFunc[handler.type](pos, handler);
            break;
    }
    e.stopPropagation();
    //const _pp = Model.GetActivedPageProperty();
    //if (_pp) {
    //}
}
function TryAddWidget(pid: pid_t, indexOfElement: number, type: WIDGET_TYPE): void {
    const _idxOfNewWidget = indexOfElement + 1;
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('widget-add-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pid, type, index: _idxOfNewWidget });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.AddWidget(pid, type, _idxOfNewWidget);
    Model.Dispatch('widget-add-event', { phase: EventPhase.AFTER_REQUEST, pid, type, index: _idxOfNewWidget });
}
function TryUpdateWidget(wc: Readonly<widget_content_t>): void {
    const pid = Model.GetPidOfWidBelongs(wc.id);
    if (pid) {
        const feedback: event_feedback_t = { ok: true };
        Model.Dispatch('widget-update-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pid, data: wc });
        if (!feedback.ok) {
            Logger.Info(feedback.reason);
            //Messager.DisplayInfoToast(`all pages fetched.`);
            return;
        }
        Model.UpdateWidget(pid, wc);
        Model.Dispatch('widget-update-event', { phase: EventPhase.AFTER_REQUEST, pid, data: wc });
    }
}
function TryFetchPageList(): void {
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('pagelist-fetch-event', { phase: EventPhase.BEFORE_REQUEST, feedback });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    Model.FetchPagelist();
    Model.Dispatch('pagelist-fetch-event', { phase: EventPhase.AFTER_REQUEST });
}

function TryUpdatePageProperty(pp: Partial<page_property_t>): void {
    if (!pp.id) return;
    const feedback: event_feedback_t = { ok: true };
    Model.Dispatch('page-update-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pageProperty: (pp as page_property_t) });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    /*
    pp.tags = pp.tags;
    pp.title = pp.title;
    pp.author = pp.author;
    pp.createTime = pp.createTime;
    pp.modifyTime = pp.modifyTime;
    pp.description = pp.description;
    */
    Object.keys(pp).forEach(k => {
        (pp as any)[k] = (pp as any)[k];
    });
    Model.UpdatePage(pp as page_property_t);
    Model.Dispatch('page-update-event', { phase: EventPhase.AFTER_REQUEST, pageProperty: pp as page_property_t });
}

function PageTitleClick(pid: pid_t): void {
    TryFetchPage(pid);
}

function NavHomeClicked(): void {
    TryFetchPageList();
}
function NavPageClicked(pos: screen_pos_t): void {
    Model.Dispatch('nav-history-display-event', { phase: EventPhase.RESPOND, pos });
}
function NavHistoryItemClicked(ui: INavUi, pid: pid_t): void {
    TryFetchPage(pid);
}

function NavHistoryItemRemoveClicked(e: MouseEvent, ui: INavUi, pid: pid_t): void {
    Logger.Debug(`history item rm`);
    Model.RemoveHistoryRecord(pid);
    e.stopPropagation();
}

function MenuItemClicked(ui: IMenuUi, selectedType: WIDGET_TYPE, index: number, pid: pid_t, wid?: wid_t): void {
    if (selectedType !== WIDGET_TYPE.UNKNOWN) {
        TryAddWidget(pid, index, selectedType);
    }
}
function MenuConfirmClicked(ui: IMenuUi, pid: pid_t, wid?: wid_t): void {
    if (wid) {
        TryDeleteWidget(wid);
    } else {
        TryDeletePage(pid);
    }
}

function Archive(): void {
    Model.Archive();
}
function TryAddTemplate(): void { }
function TemplateSaveClicked(ui: ITemplateUi, tc: template_content_t): void {
    Logger.Info(`TemplateSaveClicked. name is: ${tc.name}`);
    TryAddTemplate();
}

function Search(str: string): void {
    Model.Search(str);
}

function PageResourceClicked(e: MouseEvent, actionName: string, pos: screen_pos_t): void {
    console.log(`page resource clicked with name:${actionName}`);
    switch (actionName) {
        case "link":
            break;
        case "delete":
            break;
    }
    e.stopPropagation();
}

function SubmitResources(inp: HTMLInputElement): void {
    let _files: FileList | null = inp.files;
    if (_files && _files.length > 0) {
        let _formData = new FormData();
        for (const file of _files) {
            _formData.append("_files", file);
        }

        Model.Upload(_formData);
    }
}

export default {
    TryFetchPage,
    TryFetchPageList,
    TryAddPage,
    TryDeletePage,
    TryUpdatePageProperty,
    WidgetActionClicked,
    PageTitleClick,
    PageResourceClicked,

    NavHistoryItemClicked,
    NavHistoryItemRemoveClicked,
    NavHomeClicked,
    NavPageClicked,

    MenuItemClicked,
    MenuConfirmClicked,

    TemplateSaveClicked,

    Archive,

    Search,
    SubmitResources,
};
