import { pid_t, page_property_t } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import { screen_pos_t, screen_size_t } from "../core/types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import { INavUi } from "./ui-type"
import * as Utils from "./utils"


let _navDropdownTpl: HTMLElement;
let _navDropdownItemTpl: HTMLElement;
const _frag = document.createDocumentFragment();
export default class NavUi implements INavUi {
    private _navDropdown: HTMLElement;
    private _shownPagePid: pid_t | undefined;
    private _releaseFunc: Function = () => { };

    constructor() {
        Model.Subscribe('nav-history-changed-event', (evt: ModelEventMap['nav-history-changed-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    this.#_UpdateHistroyListUi(evt.historyList);
                    break;
            }
        });
        Model.Subscribe('nav-history-record-removed-event', (evt: ModelEventMap['nav-history-record-removed-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    if (this.#_RemoveItem(evt.pid) === 0) {
                        this._releaseFunc();
                    }
                    break;
            }
        });
        Model.Subscribe('nav-history-display-event', (evt: ModelEventMap['nav-history-display-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    this.Show(evt.pos);
                    break;
            }
        });
        Model.Subscribe('pagelist-fetch-event', (evt: ModelEventMap['pagelist-fetch-event']) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    this._shownPagePid = undefined;
                    break;
            }
        });
        Model.Subscribe('page-fetch-event', (evt: ModelEventMap['page-fetch-event']) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    this._shownPagePid = evt.id;
                    break;
            }
        });

        this._navDropdown = _navDropdownTpl.cloneNode(true) as HTMLElement;
        this._navDropdown.onclick = e => {
            const _elem: HTMLElement = e.target as HTMLElement;
            if (!_elem) return;

            if (_elem.hasAttribute('slg-title')) {
                const _pid: any = _elem.parentElement?.dataset['slgPid'];
                if (_pid) {
                    Controller.NavHistoryItemClicked(this, _pid);
                }
                return;
            }
            if (_elem.hasAttribute('slg-remove')) {
                const _pid: any = _elem.parentElement?.dataset['slgPid'];
                if (_pid) {
                    Controller.NavHistoryItemRemoveClicked(e, this, _pid);
                }
                return;
            }
        }
    }

    #_UpdateHistroyListUi(list: Readonly<Array<Readonly<page_property_t>>>): void {
        let _fr = _frag;
        for (let i = 0, N = list.length; i < N; ++i) {
            const _pp = list[i];
            const _li: Element = _navDropdownItemTpl.cloneNode(true) as Element;
            _li.setAttribute('data-slg-pid', _pp.id);
            const _a = _li.querySelector('a');
            if (_a) {
                _a.textContent = _pp.title;
            }
            _fr.append(_li);
        }

        const _ul = Utils.GetElement(this._navDropdown, 'ul');
        _ul.replaceChildren(_fr);
    }

    #_RemoveItem(pid: pid_t): number {
        const _ul = Utils.GetElement(this._navDropdown, 'ul');
        const _tmp = Array.from(_ul.children);
        const _targetLi = _tmp.find(li => {
            const _pid: any = (li as HTMLElement).dataset['slgPid'];
            return _pid === pid;
        });
        _targetLi?.remove();
        return _ul.childElementCount;
    }

    Show(pos: screen_pos_t): void {
        const _ul = Utils.GetElement(this._navDropdown, 'ul');

        let _showCount = 0;
        const _tmp = Array.from(_ul.children);
        _tmp.forEach(li => {
            const _pid: any = (li as HTMLElement).dataset['slgPid'];
            if (_pid === this._shownPagePid) {
                (li as HTMLElement).style.display = 'none';
            } else {
                (li as HTMLElement).style.removeProperty('display');
                ++_showCount;
            }
        });

        if (_showCount <= 0) return;
        this._releaseFunc();
        const _finalPos = Utils.CalcuDropdowPos(this._navDropdown, pos);
        this._navDropdown.style.top = `${_finalPos.y}px`;
        this._navDropdown.style.left = `${_finalPos.x}px`;
        document.body.append(this._navDropdown);
        document.onclick = e => {
            Logger.Info(`in coming pos:${e.clientX},${e.clientY}; finalPos:${_finalPos.x},${_finalPos.y}`);
            this._releaseFunc();
        }
        this._releaseFunc = () => {
            this._navDropdown.remove();
            document.onclick = null;
            this._releaseFunc = () => { };
        }
    }


    static Init(TPL: Element): void {
        let _InitFn: Function = () => {
            let _value = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-nav]');
            if (_value) {
                _navDropdownTpl = _value as HTMLElement;
                _navDropdownItemTpl = Utils.GetAndRemoveElement(_value, 'ul li') as HTMLElement;
            }

            _InitFn = () => {
                Logger.Error(`Init function of NavUi should always been invoked once.`);
            };
        }
        _InitFn();
    }
}


