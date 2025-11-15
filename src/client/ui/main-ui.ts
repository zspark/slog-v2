import { pid_t, page_property_t } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import * as Utils from "./utils"

export default function Init(TPL: Element): void {
    let _InitFn: Function = () => {
        const _navHome = Utils.GetElement(TPL, '[slg-nav-home]');
        let _shownPagePid: pid_t | undefined;
        if (_navHome) {
            _navHome.onclick = e => {
                Controller.NavHomeClicked();
            }
        }

        const _navPage = Utils.GetElement(TPL, '[slg-nav-page]');
        if (_navPage) {
            _navPage.onclick = e => {
                e.stopPropagation();
                //const _target: HTMLElement = _navPage;// e.target as HTMLElement;
                //debugger;
                Controller.NavPageClicked(
                    { x: _navPage.offsetLeft, y: _navPage.offsetTop + _navPage.offsetHeight + 4 }
                );
            }
        }

        const _archiveState = Utils.GetElementExt<HTMLButtonElement>(TPL, '[slg-archive-state]');
        const _archiveBtn = Utils.GetElementExt<HTMLButtonElement>(TPL, '[slg-archive]');
        if (_archiveBtn) {
            _archiveBtn.onclick = e => {
                Controller.Archive();
            }
        }
        //🧡💛💚💙💜🖤🤍🤎
        Model.Subscribe('archive-state-event', (evt: ModelEventMap['archive-state-event']) => {
            if (evt.done) {
                if (_archiveState) _archiveState.textContent = "🧡";
            } else {
                if (_archiveState) _archiveState.textContent = "🖤";
            }
        });

        Model.Subscribe('pagelist-fetch-event', (evt: ModelEventMap['pagelist-fetch-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    _shownPagePid = undefined;
                    _navPage.innerHTML = '<i>click to show list of history pages.</i>';
                    break;
            }
        });
        Model.Subscribe('page-fetch-event', (evt: ModelEventMap['page-fetch-event']) => {
            switch (evt.phase) {
                case EventPhase.BEFORE_RESPOND:
                    if (_shownPagePid === evt.id) return;
                    _shownPagePid = evt.id;
                    if (evt.property) {
                        _navPage.textContent = evt.property.title;
                    }
                    break;
            }
        });

        _InitFn = () => {
            Logger.Error(`Init function of main ui should always been invoked once.`);
        };
    }
    _InitFn();
}


