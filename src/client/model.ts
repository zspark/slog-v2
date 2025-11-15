import { Document as FDoc } from "flexsearch"
import { pid_t, wid_t, WIDGET_TYPE, page_property_t, widget_content_t, page_content_t } from "../common/types"
import { Messages } from "../common/message"
import Logger from "../common/logger"
import { screen_pos_t, screen_size_t } from "./core/types"
import { EventPhase, event_feedback_t } from "./core/event-types"
import { EventHandler } from "./core/event"
import ServerProxy from "./core/server-proxy";

export type search_result_t = {
    field: 'title' | 'tags' | 'description',
    result: Array<{
        id: string,
        doc: {
            title: string,
            description: string,
            tags: string,
        }
    }>
};
export interface ModelEventMap {
    'pagelist-fetch-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly arrPageProperty?: Array<page_property_t>;
    },
    'page-add-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pageProperty?: page_property_t;
    },
    'page-delete-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly id: pid_t;
    },
    'page-update-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pageProperty: page_property_t;
    },
    'page-fetch-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly id: pid_t;
        readonly property?: page_property_t;
        readonly content?: page_content_t;
    },
    'widget-add-event': {
        phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pid: pid_t;
        readonly type: WIDGET_TYPE,
        readonly index: number,
        readonly data?: widget_content_t;
    },
    'widget-update-event': {
        phase: EventPhase;
        feedback?: event_feedback_t;
        pid: pid_t;
        data: widget_content_t;
    },
    'widget-delete-event': {
        phase: EventPhase;
        pid: pid_t;
        wid: wid_t;
        feedback?: event_feedback_t;
    },

    'nav-history-changed-event': {
        readonly phase: EventPhase;
        readonly historyList: Array<page_property_t>;
    },
    'nav-history-record-removed-event': {
        readonly phase: EventPhase;
        readonly pid: pid_t;
    },
    'nav-history-display-event': {
        readonly phase: EventPhase;
        readonly pos: screen_pos_t;
    },

    'menu-display-event': {
        readonly phase: EventPhase;
        readonly pos: screen_pos_t;
        readonly pid: pid_t,
        readonly wid?: wid_t,
        readonly index: number,
    },
    'template-display-event': {
        readonly phase: EventPhase;
        readonly pos: screen_pos_t;
        readonly pid: pid_t,
        readonly widgetContent: widget_content_t,
    },
    'archive-state-event': {
        readonly phase: EventPhase;
        readonly done: boolean;
    },

    'search-result-display-event': {
        readonly phase: EventPhase;
        readonly data: Array<search_result_t>;
    },

    'alert-display-event': {
        readonly phase: EventPhase;
        readonly pos: screen_pos_t;
        readonly msg: string,
        readonly yesFunc?: Function,
        readonly noFunc?: Function,

    },

    'upload-finished-event': {
        readonly phase: EventPhase;
        readonly data: Messages['upload']['respond_t'];
    },
}

const _eh = new EventHandler<ModelEventMap>();
const _mapWidPid: Record<wid_t, pid_t> = {};

/**
 * data:[{page_property_t},{},..]
 */
function FetchPagelist(): void {
    ServerProxy.GetPageList().then((data) => {
        if (data) {
            data.forEach(pp => {
                _Reg(pp.id, pp.tags, pp.title, pp.description);
            });


            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.BEFORE_RESPOND });
            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.RESPOND, arrPageProperty: data });
            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.AFTER_RESPOND });
        }
    });
}

function AddPage(): void {
    ServerProxy.AddPage().then((value) => {
        if (value) {
            _eh.Dispatch('page-add-event', { phase: EventPhase.BEFORE_RESPOND });
            _eh.Dispatch('page-add-event', { phase: EventPhase.RESPOND, pageProperty: value });
            _eh.Dispatch('page-add-event', { phase: EventPhase.AFTER_RESPOND });
        }
    });
}

function DeletePage(id: pid_t): void {
    ServerProxy.DeletePage(id).then(_ => {
        _eh.Dispatch('page-delete-event', { phase: EventPhase.BEFORE_RESPOND, id });
        _eh.Dispatch('page-delete-event', { phase: EventPhase.RESPOND, id });
        _eh.Dispatch('page-delete-event', { phase: EventPhase.AFTER_RESPOND, id });
    });
}

function UpdatePage(pp: page_property_t): void {
    ServerProxy.UpdatePage(pp).then((info) => {
        _eh.Dispatch('page-update-event', { phase: EventPhase.BEFORE_RESPOND, pageProperty: pp });
        _eh.Dispatch('page-update-event', { phase: EventPhase.RESPOND, pageProperty: pp });
        _eh.Dispatch('page-update-event', { phase: EventPhase.AFTER_RESPOND, pageProperty: pp });
    });
}

function FetchPage(id: pid_t): void {
    ServerProxy.GetPage(id).then((data) => {
        if (data) {
            const pid: pid_t = id;
            data.content.indexes.forEach(wid => {
                _mapWidPid[wid] = pid;
            });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.BEFORE_RESPOND, id, content: data.content, property: data.property });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.RESPOND, id, content: data.content, property: data.property });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.AFTER_RESPOND, id, content: data.content, property: data.property });

            AppendHistoryPage(data.property);
        }
    });
}

function AddWidget(pid: pid_t, type: WIDGET_TYPE, index: number): void {
    ServerProxy.AddWidget(pid, type, index).then((value) => {
        if (value) {
            _mapWidPid[value.widgetContent.id] = pid;
            const _tmp: ModelEventMap['widget-add-event'] = { phase: EventPhase.UNKNOWN, pid, type, index, data: value?.widgetContent };
            for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
                _tmp.phase = i;
                _eh.Dispatch('widget-add-event', _tmp);
            }
        }
    });
}

function UpdateWidget(pid: pid_t, wc: widget_content_t): void {
    ServerProxy.UpdateWidget(pid, wc).then((value) => {
        const _tmp: ModelEventMap['widget-update-event'] = { phase: EventPhase.UNKNOWN, pid, data: wc };
        for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
            _tmp.phase = i;
            _eh.Dispatch('widget-update-event', _tmp);
        }
    });
}

function DeleteWidget(pid: pid_t, wid: wid_t): void {
    ServerProxy.DeleteWidget(pid, wid).then((value) => {
        const _tmp: ModelEventMap['widget-delete-event'] = { phase: EventPhase.UNKNOWN, pid, wid };
        for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
            _tmp.phase = i;
            _eh.Dispatch('widget-delete-event', _tmp);
        }
    });
}

function GetPidOfWidBelongs(wid: wid_t): pid_t | undefined {
    return _mapWidPid[wid];
}

const _arrHistoryPid: Array<page_property_t> = [];
function AppendHistoryPage(pp: page_property_t): void {
    let _idx = -1;
    for (let i = 0, N = _arrHistoryPid.length; i < N; ++i) {
        if (_arrHistoryPid[i].id === pp.id) {
            _idx = i;
            break;
        }
    }
    if (_idx === 0) return;
    if (_idx > 0) {
        _arrHistoryPid.splice(_idx, 1);
    }
    _arrHistoryPid.unshift(pp);
    _eh.Dispatch('nav-history-changed-event', { phase: EventPhase.BEFORE_RESPOND, historyList: _arrHistoryPid });
    _eh.Dispatch('nav-history-changed-event', { phase: EventPhase.RESPOND, historyList: _arrHistoryPid });
    _eh.Dispatch('nav-history-changed-event', { phase: EventPhase.AFTER_RESPOND, historyList: _arrHistoryPid });
}

function Archive(): void {
    ServerProxy.Archive().then((value) => {
        //_eh.Dispatch('archive-state-event', { phase: EventPhase.BEFORE_RESPOND });
        _eh.Dispatch('archive-state-event', { phase: EventPhase.RESPOND, done: true });
        //_eh.Dispatch('archive-state-event', { phase: EventPhase.AFTER_RESPOND });
    }, _ => {
        _eh.Dispatch('archive-state-event', { phase: EventPhase.RESPOND, done: false });
    });
}
function RemoveHistoryRecord(pid: pid_t): void {
    for (let i = _arrHistoryPid.length; --i >= 0;) {
        if (_arrHistoryPid[i].id === pid) {
            _arrHistoryPid.splice(i, 1);
            _eh.Dispatch('nav-history-record-removed-event', { phase: EventPhase.BEFORE_RESPOND, pid });
            _eh.Dispatch('nav-history-record-removed-event', { phase: EventPhase.RESPOND, pid });
            _eh.Dispatch('nav-history-record-removed-event', { phase: EventPhase.AFTER_RESPOND, pid });
            return;
        }
    }
}


const _searchIndex = new FDoc({
    //charset: "latin:extra",
    preset: 'default',
    resolution: 9,
    cache: false,
    optimize: true,

    document: {
        id: "id",
        tag: "tags",
        store: ["title", "description", "tags"],
        index: [
            {
                field: "title",
                tokenize: 'forward',
                //context: { depth: 1, },
                //minlength: 1,
                filter: ["in", "into", "is", "isn't", "it", "it's", "a", "i",]
            },
            {
                field: "description",
                tokenize: 'forward',
                filter: ["in", "into", "is", "isn't", "it", "it's", "a", "i",]
            },
            {
                field: "tags",
                tokenize: 'forward',
                //context: { depth: 1, },
                //minlength: 1,
                filter: ["in", "into", "is", "isn't", "it", "it's", "a", "i",]
            },
        ]
    }
});

function _Reg(id: string, tags: string, title: string, description: string): void {
    _searchIndex.add({
        id,
        tags,
        title,
        description
    });
}

function Search(str: string): void {
    const sth: any = _searchIndex.search(str, { enrich: true });
    _eh.Dispatch('search-result-display-event', { phase: EventPhase.BEFORE_RESPOND, data: sth });
    _eh.Dispatch('search-result-display-event', { phase: EventPhase.RESPOND, data: sth });
    _eh.Dispatch('search-result-display-event', { phase: EventPhase.AFTER_RESPOND, data: sth });
}

function Upload(data: FormData): void {
    ServerProxy.Upload(data).then((value) => {
        _eh.Dispatch('upload-finished-event', { phase: EventPhase.RESPOND, data: value });
    }, value => {
        _eh.Dispatch('upload-finished-event', { phase: EventPhase.RESPOND, data: value });
    });
}

const Subscribe = _eh.Subscribe.bind(_eh);
const Unsubscribe = _eh.Unsubscribe.bind(_eh);
const Dispatch = _eh.Dispatch.bind(_eh);
export default {
    Subscribe,
    Unsubscribe,
    Dispatch,

    FetchPagelist,
    AddPage,
    DeletePage,
    UpdatePage,
    FetchPage,
    AddWidget,
    UpdateWidget,
    DeleteWidget,
    GetPidOfWidBelongs,

    Archive,

    RemoveHistoryRecord,
    Search,

    Upload,
}


