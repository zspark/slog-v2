import { pid_t } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import { screen_pos_t, screen_size_t } from "../core/types"
import Model, { ModelEventMap, search_result_t } from "../model"
import Controller from "../controller"
import { ISearchUi } from "./ui-type"
import * as Utils from "./utils"


let _inputElement: HTMLInputElement;
let _searchDropdownTpl: HTMLElement;
let _itemElemTpl: HTMLElement;

type item_t = {
    readonly pid: pid_t,
    readonly doc: {
        title: string,
        description: string,
        tags: string,
    }
    title?: string,
    description?: string,
    tags?: string,
}

function SplitQuery(term: string): Array<string> {
    return term
        .trim()
        .toLowerCase()
        ///.replace(".", " .") // Allows to find `Map.prototype.get()` via `Map.get`.
        .split(/[ ,]+/);
}

function HighlightMatch(targetString: string, queryString: string): Array<string> {
    // Split on highlight term and include term into parts, ignore case.
    const words = SplitQuery(queryString);
    const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // $& means the whole matched string
    const regex = regexWords.map((word) => `(${word})`).join("|");
    const parts = targetString.split(new RegExp(regex, "gi"));
    //console.log(parts);
    const _out = parts.filter(Boolean).map((part, _) => {
        if (words.includes(part.toLowerCase())) {
            return `<mark>${part}</mark>`;
        } else {
            return `<span>${part}</span>`;
        }
    })
    //console.log(_out);
    return _out;
}

export default class SearchUi implements ISearchUi {
    _inputValue: string = '';

    constructor() {
        Model.Subscribe('search-result-display-event', (evt: ModelEventMap['search-result-display-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    Logger.Info(evt.data);
                    this.Show(evt.data);
            }
        });
        document.addEventListener('click', e => {
            _searchDropdownTpl.removeAttribute('active');
        });
        _searchDropdownTpl.onclick = e => {
            let _elem: Element | null = e.target as Element;

            while (true) {
                if (_elem) {
                    if (_elem.id) {
                        Controller.TryFetchPage(_elem.id);
                        break;
                    }
                    _elem = _elem.parentElement;
                } else break;
            }

            e.stopPropagation();
        }
        /*
        _inputElement.onfocus = e => {
            _searchDropdownTpl.setAttribute('active', '');
            e.stopPropagation();
        }
        _inputElement.onblur = e => {
            _searchDropdownTpl.removeAttribute('active');
        }
        */
        _inputElement.oninput = e => {
            this._inputValue = _inputElement.value;
            Controller.Search(this._inputValue);
        }

    }

    private _CreateElementForItem(item: item_t): Element {
        const _elem = _itemElemTpl.cloneNode(true) as HTMLElement;
        let _tmp = Utils.GetElement(_elem, '[slg-title]');
        if (_tmp) {
            _tmp.innerHTML = item.title ?? item.doc.title;
        }
        _tmp = Utils.GetElement(_elem, '[slg-tags]');
        if (_tmp) {
            _tmp.innerHTML = item.tags ?? item.doc.tags;
        }
        _tmp = Utils.GetElement(_elem, '[slg-description]');
        if (_tmp) {
            if (item.description) {
                _tmp.innerHTML = item.description;
            } else {
                _tmp.innerHTML = item.doc.description;
                _tmp.setAttribute('oneline', '');
            }
        }
        _elem.id = item.pid;
        return _elem;
    }

    private _GenItems(data: Array<search_result_t>, queryString: string): Record<pid_t, item_t> {
        const out: Record<pid_t, item_t> = {};
        data.forEach(sr => {
            const _field = sr.field;
            sr.result.forEach(({ id, doc }) => {
                let _item: item_t = out[id];
                if (!_item) {
                    _item = { pid: id, doc };
                    out[id] = _item;
                }
                _item[_field] = HighlightMatch(doc[_field], queryString).join('');
            });
        });
        return out;
    }

    Show(data: Array<search_result_t>): void {
        //const _fElem = _searchDropdownTpl.firstElementChild;
        const _fElem = _searchDropdownTpl;
        if (_fElem) {
            _fElem.replaceChildren();

            const _tmp = this._GenItems(data, this._inputValue);
            Object.values(_tmp).forEach(_item => {
                _fElem.append(this._CreateElementForItem(_item));
            });
            _searchDropdownTpl.setAttribute('active', '');
            /*
            const _x = _inputElement.offsetLeft;
            const _y = _inputElement.offsetTop + _inputElement.offsetHeight + 4;
            _searchDropdownTpl.style.top = `${_y}px`;
            _searchDropdownTpl.style.left = `${_x}px`;
            document.body.append(_searchDropdownTpl);
            this._arrHideFunc.push(() => {
                Logger.Info(`mouse pos: ${ e.clientX }, ${ e.clientY }`);
                _searchDropdownTpl.remove();
                _searchDropdownTpl.onclick = null;
            });
            */
        }
    }
    /*

    __removeAll(): void {
        this._arrHideFunc.forEach(fn => { fn() });
        this._arrHideFunc.length = 0;
    }
    */

    static Init(TPL: Element): boolean {
        let _InitFn: Function = () => {
            _inputElement = Utils.GetElement(TPL, '[slg-search-input]') as HTMLInputElement;
            _searchDropdownTpl = Utils.GetElement(TPL, '[slg-dropdown-search]');
            _searchDropdownTpl.removeAttribute('active');
            let _elem = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-search-item]');
            if (_elem) _itemElemTpl = _elem as HTMLElement;

            _InitFn = (): boolean => {
                Logger.Error(`Init function of SearchUi should always been invoked once.`);
                return false;
            };
            return true;
        }
        return _InitFn();
    }
}

