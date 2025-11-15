import { pid_t, wid_t, WIDGET_TYPE, widget_content_t } from "../../common/types"
import { screen_pos_t, screen_size_t } from "../core/types"

export interface INavUi {
    Show(pos: screen_pos_t): void;
}

export interface IMenuUi {
    ShowMenuAt(pos: screen_pos_t, index: number, pid: pid_t, wid?: wid_t): void;
}

export interface ICommonUi {
}
export interface ISearchUi {
}
export interface IPageUi {
}
export interface ITemplateUi {
    Show(pos: screen_pos_t, pid: pid_t, widgetContent: widget_content_t): void;
}

