import { pid_t, wid_t, WIDGET_TYPE } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import { screen_pos_t, screen_size_t } from "../core/types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import * as Utils from "./utils"

let _alertDropdownElem: HTMLElement;
Model.Subscribe('alert-display-event', (evt: ModelEventMap['alert-display-event']) => {
    switch (evt.phase) {
        case EventPhase.RESPOND:
            removeAll();
            const _msgElem = Utils.GetElement(_alertDropdownElem, '[slg-msg]') ?? _alertDropdownElem;
            _msgElem.textContent = evt.msg;
            const _finalPos = Utils.CalcuDropdowPos(_alertDropdownElem, evt.pos);
            _alertDropdownElem.style.top = `${_finalPos.y}px`;
            _alertDropdownElem.style.left = `${_finalPos.x}px`;

            const _comfirmElem = Utils.GetElement(_alertDropdownElem, '[slg-msg]') ?? _alertDropdownElem;
            _comfirmElem.onclick = e => {
                evt.yesFunc && evt.yesFunc();
            }
            document.body.append(_alertDropdownElem);
            break;
    }
});
function removeAll(): void {
    _alertDropdownElem.remove();
}

function Init(TPL: Element): boolean {
    let _InitFn: Function = (): boolean => {
        let _tmp = Utils.GetAndRemoveElement(TPL, '[slg-common-alert]');
        if (_tmp) {
            _alertDropdownElem = _tmp as HTMLElement;
        } else {
            _alertDropdownElem = document.createElement('div');
        }
        document.addEventListener('click', e => {
            removeAll();
        });

        _InitFn = (): boolean => {
            Logger.Error(`Init function of common UI should always been invoked once.`);
            return false;
        };

        return true;
    }
    return _InitFn();
}

export default {
    Init,
}
