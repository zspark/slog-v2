import { pid_t, wid_t, widget_content_t, template_content_t } from "../../common/types"
import Logger from "../../common/logger"
import { EventPhase } from "../core/event-types"
import { screen_pos_t, screen_size_t } from "../core/types"
import Model, { ModelEventMap } from "../model"
import Controller from "../controller"
import { ITemplateUi } from "./ui-type"
import * as Utils from "./utils"

let _templateDropdownTpl: HTMLElement;

export default class TemplateUi implements ITemplateUi {
    private _templateDropdown: HTMLElement;
    private _templateName: HTMLElement;
    private _templateButton: HTMLElement;
    private _templateCheckboxs: Record<string, HTMLInputElement> = {};

    constructor() {
        Model.Subscribe('template-display-event', (evt: ModelEventMap['template-display-event']) => {
            switch (evt.phase) {
                case EventPhase.RESPOND:
                    this.Show(evt.pos, evt.pid, evt.widgetContent);
                    break;
            }
        });

        this._templateDropdown = _templateDropdownTpl.cloneNode(true) as HTMLElement;
        this._templateName = Utils.GetElement(this._templateDropdown, '[slg-focus]');
        this._templateCheckboxs['content'] = Utils.GetElement(this._templateDropdown, `#cb-content`) as HTMLInputElement;
        this._templateCheckboxs['layout'] = Utils.GetElement(this._templateDropdown, `#cb-layout`) as HTMLInputElement;
        this._templateCheckboxs['action'] = Utils.GetElement(this._templateDropdown, `#cb-action`) as HTMLInputElement;
        this._templateButton = Utils.GetElement(this._templateDropdown, '[slg-btn]');
        this._templateDropdown.onclick = e => {
            e.stopPropagation();
        }
    }

    Show(pos: screen_pos_t, pid: pid_t, widgetContent: widget_content_t): void {
        const _finalPos = Utils.CalcuDropdowPos(this._templateDropdown, pos);
        this._templateDropdown.style.top = `${_finalPos.y}px`;
        this._templateDropdown.style.left = `${_finalPos.x}px`;
        this._templateButton.onclick = e => {
            const _name: string | null = this._templateName.textContent;
            if (_name) {
                const _tc: template_content_t = { tid: '', name: _name }
                if (this._templateCheckboxs['content'].checked) {
                    _tc.content = widgetContent.data.content;
                }
                if (this._templateCheckboxs['layout'].checked) {
                    _tc.layout = widgetContent.data.layout;
                }
                if (this._templateCheckboxs['action'].checked) {
                    _tc.action = widgetContent.data.action;
                }

                Controller.TemplateSaveClicked(this, _tc);
            }
        }

        document.body.append(this._templateDropdown);
        document.onclick = e => {
            Logger.Info(`in coming pos:${e.clientX},${e.clientY}; finalPos:${_finalPos.x},${_finalPos.y}`);
            this._templateDropdown.remove();
            document.onclick = null;
        }
    }


    static Init(TPL: Element): void {
        let _InitFn: Function = () => {
            let _value = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-template]');
            if (_value) {
                _templateDropdownTpl = _value as HTMLElement;
            }

            _InitFn = () => {
                Logger.Error(`Init function of TemplateUi should always been invoked once.`);
            };
        }
        _InitFn();
    }
}


