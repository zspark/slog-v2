import { pid_t, wid_t, WIDGET_TYPE } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import { screen_pos_t, screen_size_t } from "../core/types"
//import { EventHandler } from "../core/event"
//import { EventPhase } from "../core/event-types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import { IMenuUi } from "./ui-type"
import * as Utils from "./utils"

/*
interface MenuEventMap {
    'menu-selected-event': {
        readonly phase: EventPhase;
        readonly name: string;
    },
}
const _eh = new EventHandler<MenuEventMap>();
*/

const _Rec: Record<string, WIDGET_TYPE> = {
    'markdown': WIDGET_TYPE.MARKDOWN,
    'custom': WIDGET_TYPE.CUSTOM,
}

let _menuDropdownTpl: Element;

export default class MenuUi implements IMenuUi {
    private _arrHideFunc: Array<Function> = [];
    private _menuElement: HTMLElement;

    constructor() {
        Model.Subscribe('menu-display-event', (evt: ModelEventMap['menu-display-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    this.ShowMenuAt(evt.pos, evt.index, evt.pid, evt.wid);
                    break;
            }
        });
        this._menuElement = _menuDropdownTpl.cloneNode(true) as HTMLElement;
        document.addEventListener('click', e => {
            this.__removeAll();
        });
    }

    ShowMenuAt(pos: screen_pos_t, index: number, pid: pid_t, wid?: wid_t): void {
        this.__removeAll();
        const _finalPos = Utils.CalcuDropdowPos(this._menuElement, pos);
        this._menuElement.style.top = `${_finalPos.y}px`;
        this._menuElement.style.left = `${_finalPos.x}px`;
        this._menuElement.onclick = e => {
            const name: string = String((e.target as HTMLElement).dataset['slgMenu']);
            Logger.Info(`selected: ${name}`);
            Controller.MenuItemClicked(this, _Rec[name], index, pid, wid);
        }
        document.body.append(this._menuElement);
        this._arrHideFunc.push(() => {
            //Logger.Info(`mouse pos:${e.clientX},${e.clientY}`);
            this._menuElement.remove();
            this._menuElement.onclick = null;
        });
    }

    __removeAll(): void {
        this._arrHideFunc.forEach(fn => { fn() });
        this._arrHideFunc.length = 0;
    }

    static Init(TPL: Element): boolean {
        let _InitFn: Function = () => {
            let _tmp = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-widgets]');
            if (_tmp) {
                _menuDropdownTpl = _tmp;
            }
            _InitFn = (): boolean => {
                Logger.Error(`Init function of MenuUi should always been invoked once.`);
                return false;
            };

            return !!_menuDropdownTpl;
        }
        return _InitFn();
    }
}




//const Subscribe = _eh.Subscribe.bind(_eh);
//const Unsubscribe = _eh.Unsubscribe.bind(_eh);
//const Dispatch = _eh.Dispatch.bind(_eh);
//export default { Subscribe, Unsubscribe, ShowMenuAt, Init }
