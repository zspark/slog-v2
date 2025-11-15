import { pid_t, wid_t, WIDGET_TYPE, widget_content_t, page_property_t } from "../../common/types"
import Logger from "../../common/logger"
import {
    IServerRPC,
    RequestCode,
    Messages,
} from "../../common/message"

const _formHeader: Headers = new Headers();
//_formHeader.append("Content-Type", "multipart/form-data");
async function _Upload(data: FormData, delay: number = 5000, headers: Headers = _formHeader): Promise<any> {
    const _ctrl = new AbortController()    // timeout
    setTimeout(() => _ctrl.abort(), delay);
    const response = await fetch("/upload",
        { method: "POST", headers, body: data, signal: _ctrl.signal }
    );
    return response.json().then((cbData) => {
        //Logger.Info(`server respond:`, cbData);
        if (cbData.code < 0) {
            //Logger.Error(`server respond: code:${cbData.code}, msg:${cbData.msg}`);
            return Promise.reject(cbData);
        } else {
            return cbData;
        }
    }, (error) => {
        Logger.Error(`net error ->`, error);
        return Promise.reject(error.msg);
    });
}

const _jsonHeader: Headers = new Headers();
_jsonHeader.append("Content-Type", "application/json");
async function _Post(req: any, headers: Headers = _jsonHeader): Promise<any> {
    const response = await fetch("/service", { method: "POST", headers, body: JSON.stringify(req) });
    return response.json().then((cbData) => {
        if (cbData.code < 0) {
            Logger.Error(`server respond: code:${cbData.code}, msg:${cbData.msg}`);
            return Promise.reject();
        } else {
            return cbData.data;
        }
    }, (error) => {
        Logger.Error(`net error -> ${error}`);
        return Promise.reject(error.msg);
    });
}

function ReadWriteAuthorization(): IServerRPC {
    return {
        Login(account: string, pwd: string): Promise<Messages['login']['respond_t']['data']> {
            return _Post({ code: RequestCode.LOGIN, data: { remeberMe: true, account, pwd } });
        },
        GetPageList(): Promise<Messages['getPageList']['respond_t']['data']> {
            return _Post({ code: RequestCode.GET_PAGE_LIST, data: {} });
        },
        GetPage(id: pid_t): Promise<Messages['getPage']['respond_t']['data']> {
            return _Post({ code: RequestCode.GET_PAGE, data: { id } });
        },
        AddPage(): Promise<Messages['addPage']['respond_t']['data']> {
            return _Post({ code: RequestCode.ADD_PAGE, data: {} });
        },
        UpdatePage(pp: page_property_t): Promise<Messages['updatePage']['respond_t']['data']> {
            return _Post({ code: RequestCode.UPDATE_PAGE, data: { pp } });
        },
        DeletePage(id: pid_t): Promise<Messages['deletePage']['respond_t']['data']> {
            return _Post({ code: RequestCode.DELETE_PAGE, data: { id } });
        },
        AddWidget(id: pid_t, type: WIDGET_TYPE, index: number = Number.MAX_SAFE_INTEGER): Promise<Messages['addWidget']['respond_t']['data']> {
            return _Post({ code: RequestCode.ADD_WIDGET, data: { pid: id, type, index } });
        },
        UpdateWidget(pid: pid_t, wc: widget_content_t): Promise<Messages['updateWidget']['respond_t']['data']> {
            return _Post({ code: RequestCode.UPDATE_WIDGET, data: { pid, wc } });
        },
        DeleteWidget(pid: pid_t, wid: wid_t): Promise<Messages['deleteWidget']['respond_t']['data']> {
            return _Post({ code: RequestCode.DELETE_WIDGET, data: { pid, wid } });
        },
        Archive(): Promise<Messages['archive']['respond_t']['data']> {
            return _Post({ code: RequestCode.ARCHIVE, data: {} });
        },
        Upload(data: FormData): Promise<Messages['upload']['respond_t']> {
            return _Upload(data);
        },
    };
}
/*
function ReadOnlyAuthorization(): IServerRPC {
const _RejectFunc = () => { return Promise.reject(undefined); };
return {
GetPageList(): Promise<Messages['getPageList']['respond_t']['data']> {
    return _Post<'getPageList'>({ code: RequestCode.GET_PAGE_LIST, data: {} });
},
GetPage(id: pid_t): Promise<Messages['getPage']['respond_t']['data']> {
    return _Post<'getPage'>({ code: RequestCode.GET_PAGE, data: { id } });
},
AddPage(): Promise<Messages['addPage']['respond_t']['data']> {
    return Promise.reject();
},
UpdatePage(pp: page_property_t): Promise<Messages['updatePage']['respond_t']['data']> {
    return Promise.reject();
}
Login(user: string, pwd: string): Promise<any> {
    return _Post(RequestCode.LOGIN, { user, pwd });
},
 
GetFolderContentInfo: _RejectFunc,
AddPageProperty: _RejectFunc,
UpdatePageProperty: _RejectFunc,
DeletePageProperty: _RejectFunc,
AddWidgetContent: _RejectFunc,
UpdateWidgetContent: _RejectFunc,
MoveWidgetContent: _RejectFunc,
DeleteWidgetContent: _RejectFunc,
Archive: _RejectFunc,
Log: _RejectFunc,
};
}
*/

//const _api: IServerRPC = document.cookie.indexOf("user=") >= 0 ? ReadWriteAuthorization() : ReadOnlyAuthorization();
const _api: IServerRPC = ReadWriteAuthorization();
export default _api;

