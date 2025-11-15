import { url_t, path_t, pid_t, wid_t, page_property_t } from "../common/types"
import { RespondCode } from "../common/message"
import Logger from "../common/logger"
import { USER_TYPE } from "./core/privilege"
import SummaryManager from "./summary-manager"

export interface IPropertyWorker {
    GetProperty(pid: pid_t): page_property_t | undefined;
    GetProperties(): Array<page_property_t>;
    UpdateProperty(pp: page_property_t): RespondCode;
    DeleteProperty(pid: pid_t): boolean;
    CreateProperty(): page_property_t | undefined;
}

function CreateReadWorker(): IPropertyWorker {
    return {
        GetProperty: SummaryManager.GetProperty,
        GetProperties: SummaryManager.GetProperties,
        UpdateProperty(_: page_property_t): RespondCode {
            return RespondCode.FORBIDDEN;
        },
        DeleteProperty: (_: pid_t): boolean => {
            Logger.Info(`visitor can not delete page`);
            return false;
        },
        CreateProperty: (): page_property_t | undefined => {
            Logger.Info(`visitor can not create page`);
            return undefined;
        },
    };
}

function CreateReadWriteWorker(): IPropertyWorker {
    return {
        GetProperty: SummaryManager.GetProperty,
        GetProperties: SummaryManager.GetProperties,
        UpdateProperty(pp: page_property_t): RespondCode {
            const _code = SummaryManager.ModifyProperty(pp);
            if (_code > 0) {
                SummaryManager.SaveToDisk();
            }
            return _code;
        },
        DeleteProperty: (id: pid_t): boolean => {
            const _out = SummaryManager.DeleteProperty(id);
            _out && SummaryManager.SaveToDisk();
            return _out;
        },
        CreateProperty: SummaryManager.CreateProperty,
    };
}

export function GetPagePropertyWorker(userType: USER_TYPE,): IPropertyWorker {
    Logger.Debug('GetPagePropertyWorker', userType);
    switch (userType) {
        case USER_TYPE.UNKNOWN:
        case USER_TYPE.FORBIDDANCE:
            //Logger.Debug('FORBIDDANCE');
            return CreateReadWorker();
        case USER_TYPE.VISITOR:
            //Logger.Debug('VISITOR');
            return CreateReadWorker();
        case USER_TYPE.EDITOR:
        case USER_TYPE.MASTER:
            //Logger.Debug('CONTRIBUTOR');
            return CreateReadWriteWorker();
    }
}
