'use strict';

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var FS = require('fs');
var formidable = require('formidable');
var node_child_process = require('node:child_process');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var bodyParser__namespace = /*#__PURE__*/_interopNamespaceDefault(bodyParser);
var FS__namespace = /*#__PURE__*/_interopNamespaceDefault(FS);

var Logger = {
    Error: console.debug.bind(undefined, '[SLOG-error]'),
    Warn: console.debug.bind(undefined, '[SLOG-warn]'),
    Info: console.debug.bind(undefined, '[SLOG-info]'),
    Debug: console.debug.bind(undefined, '[SLOG-debug]'),
};

const _ROOT = './';
const GlobalPaths = Object.freeze({
    ROOT: _ROOT,
    ROOT_DEPLOYMENT: _ROOT + "../deployment/",
    ROOT_SERVER: _ROOT + "src/",
    ROOT_CONTENT: _ROOT + "../deployment/content/",
    ROOT_CLIENT: _ROOT + "../deployment/www/",
    ROOT_ASSETS: _ROOT + "../deployment/content/assets/",
});
Logger.Info(`root path is:${GlobalPaths.ROOT}
www(client) path is:${GlobalPaths.ROOT_CLIENT}
server path is:${GlobalPaths.ROOT_SERVER}
content path is:${GlobalPaths.ROOT_CONTENT}`);

var RequestCode;
(function (RequestCode) {
    RequestCode[RequestCode["GET_PAGE_LIST"] = 2] = "GET_PAGE_LIST";
    RequestCode[RequestCode["GET_PAGE"] = 6] = "GET_PAGE";
    RequestCode[RequestCode["ADD_PAGE"] = 3] = "ADD_PAGE";
    RequestCode[RequestCode["UPDATE_PAGE"] = 4] = "UPDATE_PAGE";
    RequestCode[RequestCode["DELETE_PAGE"] = 5] = "DELETE_PAGE";
    RequestCode[RequestCode["ADD_WIDGET"] = 7] = "ADD_WIDGET";
    RequestCode[RequestCode["UPDATE_WIDGET"] = 8] = "UPDATE_WIDGET";
    RequestCode[RequestCode["MOVE_SECTION_DATA"] = 9] = "MOVE_SECTION_DATA";
    RequestCode[RequestCode["DELETE_WIDGET"] = 10] = "DELETE_WIDGET";
    RequestCode[RequestCode["GET_FOLDER_CONTENT_INFO"] = 20] = "GET_FOLDER_CONTENT_INFO";
    RequestCode[RequestCode["UPDATE_EXTERNAL_WEB_INNFO"] = 30] = "UPDATE_EXTERNAL_WEB_INNFO";
    RequestCode[RequestCode["UPLOAD_FILES"] = 40] = "UPLOAD_FILES";
    RequestCode[RequestCode["LOGIN"] = 50] = "LOGIN";
    RequestCode[RequestCode["CLIENT_STATUS"] = 998] = "CLIENT_STATUS";
    RequestCode[RequestCode["ARCHIVE"] = 999] = "ARCHIVE";
})(RequestCode || (RequestCode = {}));
var RespondCode;
(function (RespondCode) {
    RespondCode[RespondCode["FAIL"] = -1] = "FAIL";
    RespondCode[RespondCode["FILE_NOT_EXIST"] = -2] = "FILE_NOT_EXIST";
    RespondCode[RespondCode["ACCOUNT_NOT_EXIST"] = -4] = "ACCOUNT_NOT_EXIST";
    RespondCode[RespondCode["SESSION_NOT_EXIST"] = -5] = "SESSION_NOT_EXIST";
    RespondCode[RespondCode["PASSWORD_ERROR"] = -8] = "PASSWORD_ERROR";
    RespondCode[RespondCode["PAGE_NOT_EXIST"] = -9] = "PAGE_NOT_EXIST";
    RespondCode[RespondCode["META_ALREADY_EXIST"] = -10] = "META_ALREADY_EXIST";
    RespondCode[RespondCode["SECTION_ALREADY_EXIST"] = -11] = "SECTION_ALREADY_EXIST";
    RespondCode[RespondCode["SECTION_NOT_EXIST"] = -12] = "SECTION_NOT_EXIST";
    RespondCode[RespondCode["QUEST_CODE_INVALID"] = -30] = "QUEST_CODE_INVALID";
    RespondCode[RespondCode["JSON_PARSING_ERROR"] = -50] = "JSON_PARSING_ERROR";
    RespondCode[RespondCode["NOT_PUBLISHED"] = -100] = "NOT_PUBLISHED";
    RespondCode[RespondCode["FORBIDDEN"] = -400] = "FORBIDDEN";
    RespondCode[RespondCode["SHELL_CALL_ERROR"] = -999] = "SHELL_CALL_ERROR";
    RespondCode[RespondCode["INVALID_ARGUMENT"] = -1000] = "INVALID_ARGUMENT";
    RespondCode[RespondCode["UPLOAD_FAILED"] = -2000] = "UPLOAD_FAILED";
    RespondCode[RespondCode["UNKNOW_ERROR"] = -999999] = "UNKNOW_ERROR";
    RespondCode[RespondCode["UNKNOWN"] = 0] = "UNKNOWN";
    RespondCode[RespondCode["OK"] = 1] = "OK";
    RespondCode[RespondCode["OK_WITH_INFO"] = 2] = "OK_WITH_INFO";
    RespondCode[RespondCode["HEART_BEAT"] = 999999] = "HEART_BEAT";
})(RespondCode || (RespondCode = {}));
var DataType;
(function (DataType) {
    DataType[DataType["ARTICLE"] = 10] = "ARTICLE";
    DataType[DataType["TAG"] = 10] = "TAG";
    DataType[DataType["NOTEBOOK"] = 10] = "NOTEBOOK";
})(DataType || (DataType = {}));
var HistoryActionType;
(function (HistoryActionType) {
    HistoryActionType["UNKNOWN"] = "unknown";
    HistoryActionType["NEW"] = "new";
    HistoryActionType["DELETE"] = "deleted";
    HistoryActionType["MODIFIED"] = "modified";
})(HistoryActionType || (HistoryActionType = {}));

function GenID(prefix = 'id') {
    return prefix + Math.round((Math.random() * 1e18)).toString(36).substring(0, 10);
}

function ReadFileUTF8(fileURL, cb) {
    if (IsFileOrFolderExist(fileURL)) {
        if (cb) {
            FS__namespace.readFile(fileURL, "utf8", (err, data) => {
                if (err) {
                    cb(null);
                }
                else {
                    cb(data);
                }
            });
        }
        else {
            let file = FS__namespace.readFileSync(fileURL, "utf8");
            return file;
        }
    }
}
function IsFileOrFolderExist(fileURL) {
    return FS__namespace.existsSync(fileURL);
}
function CreateFolderIfNotExist(folderPath) {
    if (FS__namespace.existsSync(folderPath))
        return false;
    FS__namespace.mkdirSync(folderPath, { recursive: true });
    return true;
}
function DeleteFile(fileURL) {
    if (IsFileOrFolderExist(fileURL)) {
        FS__namespace.unlinkSync(fileURL);
        return true;
    }
    else
        return false;
}
function WriteFileUTF8(fileURL, data, extension = "", cb) {
    if (cb) {
        FS__namespace.writeFile(fileURL, data, (err) => {
            if (err) {
                cb(false);
            }
            else {
                cb(true);
            }
        });
    }
    else {
        FS__namespace.writeFileSync(fileURL + extension, data);
    }
    return true;
}

var PRIVILEGE;
(function (PRIVILEGE) {
    PRIVILEGE[PRIVILEGE["UNKNOWN"] = 0] = "UNKNOWN";
    PRIVILEGE[PRIVILEGE["READ"] = 1] = "READ";
    PRIVILEGE[PRIVILEGE["MODIFY"] = 2] = "MODIFY";
    PRIVILEGE[PRIVILEGE["CREATE"] = 4] = "CREATE";
    PRIVILEGE[PRIVILEGE["DELETE"] = 8] = "DELETE";
})(PRIVILEGE || (PRIVILEGE = {}));
var USER_TYPE;
(function (USER_TYPE) {
    USER_TYPE[USER_TYPE["FORBIDDANCE"] = -9999] = "FORBIDDANCE";
    USER_TYPE[USER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
    USER_TYPE[USER_TYPE["VISITOR"] = 1] = "VISITOR";
    USER_TYPE[USER_TYPE["EDITOR"] = 10] = "EDITOR";
    USER_TYPE[USER_TYPE["MASTER"] = 9999] = "MASTER";
})(USER_TYPE || (USER_TYPE = {}));
var ACCESSIBILITY;
(function (ACCESSIBILITY) {
    ACCESSIBILITY[ACCESSIBILITY["UNKNOWN"] = 0] = "UNKNOWN";
    ACCESSIBILITY[ACCESSIBILITY["CAN_BE_READ"] = 1] = "CAN_BE_READ";
    ACCESSIBILITY[ACCESSIBILITY["CAN_BE_MODIFIED"] = 2] = "CAN_BE_MODIFIED";
    ACCESSIBILITY[ACCESSIBILITY["CAN_BE_DELETED"] = 4] = "CAN_BE_DELETED";
})(ACCESSIBILITY || (ACCESSIBILITY = {}));
var VISIBILITY;
(function (VISIBILITY) {
    VISIBILITY[VISIBILITY["UNKNOWN"] = 0] = "UNKNOWN";
    VISIBILITY[VISIBILITY["HIDEN_TO_VISITOR"] = 8] = "HIDEN_TO_VISITOR";
    VISIBILITY[VISIBILITY["HIDEN_TO_EDITOR"] = 64] = "HIDEN_TO_EDITOR";
})(VISIBILITY || (VISIBILITY = {}));

function MakeVersion(m, n, p, b) {
    return {
        major: m,
        minor: n,
        patch: p,
        build: b
    };
}
function GetVersionString(v, detail = -1) {
    if (detail === 1) {
        return `v${v.major}`;
    }
    else if (detail === 2) {
        return `v${v.major}.${v.minor}`;
    }
    else if (detail === 3) {
        return `v${v.major}.${v.minor}.${v.patch}`;
    }
    return `v${v.major}.${v.minor}.${v.patch}.${v.build}`;
}

const _newestVersion$1 = MakeVersion(0, 5, 0, 0);
const _newestVersionString$1 = GetVersionString(_newestVersion$1, 2);
function Update$1(arrUser) {
    const _tmp = {
        version: _newestVersion$1,
        users: [],
    };
    for (let i = 0, N = arrUser.length; i < N; ++i) {
        _tmp.users.push({
            account: arrUser[i].account,
            password: arrUser[i].password,
            type: arrUser[i].type,
            displayName: arrUser[i].displayName,
            privilege: arrUser[i].privilege,
        });
    }
    return JSON.stringify(_tmp);
}
const _Parsers$1 = {};
_Parsers$1[GetVersionString(MakeVersion(0, 5, 0, 0), 2)] = (input, out) => {
    var _a, _b;
    for (let i = 0, N = input.users.length; i < N; ++i) {
        const _tmp = input.users[i];
        let _u = {
            account: _tmp.account,
            password: _tmp.password,
            displayName: _tmp.displayName,
            type: (_a = _tmp.type) !== null && _a !== void 0 ? _a : USER_TYPE.VISITOR,
            privilege: (_b = _tmp.privilege) !== null && _b !== void 0 ? _b : PRIVILEGE.READ,
            registTime: new Date().toISOString(),
        };
        out.push(_u);
    }
};
function Parse$1(input, out) {
    try {
        const _tmp = JSON.parse(input);
        const _V = GetVersionString(_tmp.version, 2);
        const _parser = _Parsers$1[_V];
        if (_parser) {
            _parser(_tmp, out);
            if (out.length <= 0) {
                Logger.Error(`users.json file has NO content, please add manully.`);
            }
            return _V !== _newestVersionString$1;
        }
        else {
            Logger.Error('there is No such parser for user file of version:', _V);
            return false;
        }
    }
    catch (e) {
        Logger.Error('user file parse error!\n', e);
        return false;
    }
}
var UserFileUpdater = { Parse: Parse$1, Update: Update$1 };

const VISITOR_ID = 'id-visitor';
const visitor = {
    account: VISITOR_ID,
    password: '',
    privilege: PRIVILEGE.READ,
    type: USER_TYPE.VISITOR,
    displayName: "visitor",
    registTime: new Date().toISOString(),
};
class User {
    constructor(data) {
        Logger.Info(`User info: account->${data.account}, name->${data.displayName}`);
        this._userInfo = data;
    }
    get account() { return this._userInfo.account; }
    get displayName() { return this._userInfo.displayName; }
    get privilege() { return this._userInfo.privilege; }
    get type() { return this._userInfo.type; }
    get userInfo() {
        return JSON.parse(JSON.stringify(this._userInfo));
    }
    CheckPassword(pwd) {
        return this._userInfo.password === pwd;
    }
}
const users = new Map();
(function () {
    const _userFileURL = GlobalPaths.ROOT_CONTENT + "users.json";
    const _str = ReadFileUTF8(_userFileURL);
    if (!_str) {
        Logger.Error(`no users.josn file exist, please create manully.`);
    }
    else {
        const _arrUser = [];
        if (UserFileUpdater.Parse(_str, _arrUser)) {
            WriteFileUTF8(_userFileURL, UserFileUpdater.Update(_arrUser));
        }
        if (_arrUser.length > 0) {
            for (let i = 0, _N = _arrUser.length; i < _N; ++i) {
                const _data = _arrUser[i];
                users.set(_data.account, new User(_data));
            }
            users.set(visitor.account, new User(visitor));
        }
        else {
            Logger.Error(`users.json file has NO info, please add manully.`);
        }
    }
})();
function CheckAccount(account, pwd) {
    if (account && pwd) {
        let _u = users.get(account);
        if (_u) {
            if (_u.CheckPassword(pwd)) {
                return RespondCode.OK;
            }
            else {
                return RespondCode.PASSWORD_ERROR;
            }
        }
        return RespondCode.ACCOUNT_NOT_EXIST;
    }
    return RespondCode.UNKNOW_ERROR;
}
function GetUser(account) {
    return users.get(account);
}
function GetVisitor() {
    return GetUser(visitor.account);
}

const _newestVersion = MakeVersion(0, 5, 0, 0);
const _newestVersionString = GetVersionString(_newestVersion, 2);
const _Parsers = {};
_Parsers[GetVersionString(MakeVersion(0, 5, 0, 0), 2)] = (input, out) => {
    var _a, _b;
    for (let i = 0, N = input.pages.length; i < N; ++i) {
        const _tmp = input.pages[i];
        let _u = {
            id: _tmp.id,
            createTime: _tmp.createTime,
            modifyTime: _tmp.modifyTime,
            title: _tmp.title,
            author: '',
            description: _tmp.description,
            tags: _tmp.tags,
            resources: [],
        };
        const _N = (_b = (_a = _tmp.resources) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        for (let i = 0; i < _N; ++i) {
            const _r = {
                name: _tmp.resources[i].name,
                dim: [..._tmp.resources[i].dim],
                sizeInBytes: _tmp.resources[i].sizeInBytes,
            };
            _u.resources.push(_r);
        }
        out.push(_u);
    }
};
function Parse(input, out) {
    try {
        const _tmp = JSON.parse(input);
        const _V = GetVersionString(_tmp.version, 2);
        const _parser = _Parsers[_V];
        if (_parser) {
            _parser(_tmp, out);
            return _V !== _newestVersionString;
        }
        else {
            Logger.Error('there is No such parser for summary file of version:', _V);
            return false;
        }
    }
    catch (e) {
        Logger.Error('summary file parse error!\n', e);
        return false;
    }
}
function Update(input) {
    const _tmp = {
        version: _newestVersion,
        pages: [],
    };
    for (let i = 0, N = input.length; i < N; ++i) {
        const _r = input[i];
        const _p = {
            id: _r.id,
            title: _r.title,
            createTime: _r.createTime,
            modifyTime: _r.modifyTime,
            description: _r.description,
            tags: _r.tags,
            resources: [],
        };
        for (let j = 0, N = _r.resources.length; j < N; ++j) {
            const _tmp = {
                name: _r.resources[j].name,
                dim: [..._r.resources[j].dim],
                sizeInBytes: _r.resources[j].sizeInBytes,
            };
            _p.resources.push(_tmp);
        }
        _tmp.pages.push(_p);
    }
    return JSON.stringify(_tmp);
}
var SummaryFileUpdater = { Update, Parse };

class Collection {
    constructor() {
        this._arr = [];
        this._map = new Map();
    }
    _MoveToIndex(value, oldIndex, newIndex) {
        if (oldIndex >= 0) {
            newIndex = Math.max(0, newIndex);
            if (oldIndex === newIndex)
                return oldIndex;
            this._arr.splice(oldIndex, 1);
            this._arr.splice(newIndex, 0, value);
            return this._arr.indexOf(value);
        }
        return -1;
    }
    _Insert(value, index) {
        const _idx = this._arr.indexOf(value);
        if (_idx >= 0)
            return false;
        index = Math.max(0, index);
        this._arr.splice(index, 0, value);
        this._map.set(value.id, value);
        return true;
    }
    _Remove(value) {
        if (!value)
            return false;
        const _i = this._arr.indexOf(value);
        if (_i >= 0) {
            this._arr.splice(_i, 1);
            this._map.delete(value.id);
            return true;
        }
        return false;
    }
    Insert(value, index = Number.MAX_SAFE_INTEGER) {
        return this._Insert(value, index);
    }
    ;
    InsertBefore(value, E) {
        const _idx = this._arr.indexOf(E);
        if (_idx >= 0) {
            return this._Insert(value, _idx);
        }
        return false;
    }
    ;
    InsertAfter(value, E) {
        const _idx = this._arr.indexOf(E);
        if (_idx >= 0) {
            return this._Insert(value, _idx + 1);
        }
        return false;
    }
    ;
    Remove(value) {
        return this._Remove(value);
    }
    ;
    RemoveByKey(key) {
        return this._Remove(this._map.get(key));
    }
    ;
    RemoveByIndex(index) {
        const _value = this._arr[index];
        return this._Remove(_value);
    }
    ;
    Clear() {
        this._arr.length = 0;
        this._map.clear();
    }
    ;
    GetByIndex(index) {
        return this._arr[index];
    }
    ;
    GetByKey(key) {
        return this._map.get(key);
    }
    ;
    IndexOf(value) {
        return this._arr.indexOf(value);
    }
    ;
    MoveToIndex(value, index) {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, index);
    }
    ;
    MoveUp(value) {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, _index - 1);
    }
    ;
    MoveDown(value) {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, _index + 1);
    }
    ;
    Has(value) {
        return this._map.has(value.id);
    }
    ;
    HasKey(key) {
        return this._map.has(key);
    }
    ;
    ForEach(fn, thisArg) {
        for (let i = 0, N = this._arr.length; i < N; ++i) {
            if (fn.call(thisArg, this._arr[i], i))
                break;
        }
    }
    ;
    ForEachInverse(fn, thisArg) {
        for (let i = this._arr.length - 1; i >= 0; --i) {
            if (fn.call(thisArg, this._arr[i], i))
                break;
        }
    }
    ;
    get length() { return this._arr.length; }
    ;
    DebugPrint(msg) {
        console.group(msg);
        for (let i = 0, N = this._arr.length; i < N; ++i) {
            console.log('key:', this._arr[i]);
        }
        console.groupEnd();
    }
}

const _summaryFileURL = `${GlobalPaths.ROOT_CONTENT}pages/summary.json`;
const _pageCollection = new Collection();
(function () {
    const _tmp = ReadFileUTF8(_summaryFileURL);
    if (_tmp) {
        const _output = [];
        if (SummaryFileUpdater.Parse(_tmp, _output)) {
            SaveToDisk(_output);
        }
        for (let i = 0, N = _output.length; i < N; ++i) {
            _pageCollection.Insert(_output[i]);
        }
    }
})();
function SaveToDisk(input) {
    WriteFileUTF8(_summaryFileURL, SummaryFileUpdater.Update(input !== null && input !== void 0 ? input : GetProperties()));
}
function GetProperty(id) {
    const _pp = _pageCollection.GetByKey(id);
    if (_pp) {
        return JSON.parse(JSON.stringify(_pp));
    }
    return undefined;
}
function GetProperties() {
    const _out = [];
    _pageCollection.ForEach((v, _) => {
        _out.push(JSON.parse(JSON.stringify(v)));
        return false;
    }, undefined);
    return _out;
}
function ModifyProperty(pp) {
    const _pp = _pageCollection.GetByKey(pp.id);
    if (_pp) {
        _pp.createTime = pp.createTime;
        _pp.modifyTime = pp.modifyTime;
        _pp.title = pp.title;
        _pp.author = pp.author;
        _pp.description = pp.description;
        _pp.tags = pp.tags;
        return RespondCode.OK;
    }
    return RespondCode.PAGE_NOT_EXIST;
}
function DeleteProperty(id) {
    return _pageCollection.RemoveByKey(id);
}
function CreateProperty() {
    const _pp = {
        id: GenID(),
        description: '',
        createTime: new Date().toISOString(),
        modifyTime: new Date().toISOString(),
        title: new Date().toString(),
        author: '',
        tags: '',
        resources: [],
    };
    _pageCollection.Insert(_pp, -1);
    return _pp;
}
var SummaryManager = { GetProperty, GetProperties, ModifyProperty, DeleteProperty, CreateProperty, SaveToDisk };

function CreateReadWorker$1() {
    return {
        GetProperty: SummaryManager.GetProperty,
        GetProperties: SummaryManager.GetProperties,
        UpdateProperty(_) {
            return RespondCode.FORBIDDEN;
        },
        DeleteProperty: (_) => {
            Logger.Info(`visitor can not delete page`);
            return false;
        },
        CreateProperty: () => {
            Logger.Info(`visitor can not create page`);
            return undefined;
        },
    };
}
function CreateReadWriteWorker$1() {
    return {
        GetProperty: SummaryManager.GetProperty,
        GetProperties: SummaryManager.GetProperties,
        UpdateProperty(pp) {
            const _code = SummaryManager.ModifyProperty(pp);
            if (_code > 0) {
                SummaryManager.SaveToDisk();
            }
            return _code;
        },
        DeleteProperty: (id) => {
            const _out = SummaryManager.DeleteProperty(id);
            _out && SummaryManager.SaveToDisk();
            return _out;
        },
        CreateProperty: SummaryManager.CreateProperty,
    };
}
function GetPagePropertyWorker(userType) {
    Logger.Debug('GetPagePropertyWorker', userType);
    switch (userType) {
        case USER_TYPE.UNKNOWN:
        case USER_TYPE.FORBIDDANCE:
            return CreateReadWorker$1();
        case USER_TYPE.VISITOR:
            return CreateReadWorker$1();
        case USER_TYPE.EDITOR:
        case USER_TYPE.MASTER:
            return CreateReadWriteWorker$1();
    }
}

var PANE_TYPE;
(function (PANE_TYPE) {
    PANE_TYPE["UNKNOWN"] = "unknown";
    PANE_TYPE["CONTENT"] = "content";
    PANE_TYPE["LAYOUT"] = "layout";
    PANE_TYPE["ACTION"] = "action";
})(PANE_TYPE || (PANE_TYPE = {}));
var WIDGET_STATE;
(function (WIDGET_STATE) {
    WIDGET_STATE[WIDGET_STATE["EDITOR"] = -1] = "EDITOR";
    WIDGET_STATE[WIDGET_STATE["UNKNOWN"] = 0] = "UNKNOWN";
    WIDGET_STATE[WIDGET_STATE["VIEW"] = 1] = "VIEW";
})(WIDGET_STATE || (WIDGET_STATE = {}));
var WIDGET_TYPE;
(function (WIDGET_TYPE) {
    WIDGET_TYPE["UNKNOWN"] = "unknown";
    WIDGET_TYPE["PAGE_NEW"] = "page_new";
    WIDGET_TYPE["PROPERTY"] = "property";
    WIDGET_TYPE["MARKDOWN"] = "markdown";
    WIDGET_TYPE["CUSTOM"] = "custom";
    WIDGET_TYPE["TEMPLATE"] = "template";
})(WIDGET_TYPE || (WIDGET_TYPE = {}));
var WIDGET_ACTION;
(function (WIDGET_ACTION) {
    WIDGET_ACTION[WIDGET_ACTION["NONE"] = 0] = "NONE";
    WIDGET_ACTION[WIDGET_ACTION["NEW"] = 1] = "NEW";
    WIDGET_ACTION[WIDGET_ACTION["TOGGLE"] = 2] = "TOGGLE";
    WIDGET_ACTION[WIDGET_ACTION["PREVIEW"] = 4] = "PREVIEW";
    WIDGET_ACTION[WIDGET_ACTION["SAVE"] = 8] = "SAVE";
    WIDGET_ACTION[WIDGET_ACTION["DELETE"] = 16] = "DELETE";
    WIDGET_ACTION[WIDGET_ACTION["SAVE_TEMPLATE"] = 128] = "SAVE_TEMPLATE";
})(WIDGET_ACTION || (WIDGET_ACTION = {}));

const _PAGES_PATH_ = `${GlobalPaths.ROOT_CONTENT}pages/`;
var content_flag;
(function (content_flag) {
    content_flag[content_flag["config"] = 0] = "config";
})(content_flag || (content_flag = {}));
const _TEMPLATE_CONFIG_ = {
    id: '',
    indexes: [],
    sections: {},
};
function _SaveConfigFile(pc) {
    const _data = {
        id: pc.id,
        indexes: [...pc.indexes],
        sections: {},
    };
    WriteFileUTF8(`${_PAGES_PATH_}${pc.id}/config.json`, JSON.stringify(_data));
}
function _GetWidgetContent(pid, wid) {
    const _str = ReadFileUTF8(`${_PAGES_PATH_}${pid}/${wid}`);
    if (_str) {
        try {
            let _obj = JSON.parse(_str);
            return _obj;
        }
        catch (e) {
            Logger.Error(`json parsing error`);
        }
    }
    return { id: '', type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
}
function _GetPageContent(pid, withWidgetContent) {
    const _out = ReadFileUTF8(`${_PAGES_PATH_}${pid}/config.json`);
    if (_out) {
        try {
            const _pc = JSON.parse(_out);
            if (withWidgetContent) {
                for (let i = 0, N = _pc.indexes.length; i < N; ++i) {
                    const _id = _pc.indexes[i];
                    _pc.sections[_id] = _GetWidgetContent(pid, _id);
                }
            }
            return _pc;
        }
        catch (e) {
            Logger.Error(`json parsing error`);
        }
    }
    const _pc = JSON.parse(JSON.stringify(_TEMPLATE_CONFIG_));
    _pc.id = pid;
    _SaveConfigFile(_pc);
    return _pc;
}
function _UpdateWidgetContent(pid, wc) {
    const _url = `${_PAGES_PATH_}${pid}/${wc.id}`;
    WriteFileUTF8(_url, JSON.stringify(wc));
}
function _DeleteWidgetContent(pid, wid) {
    const _url = `${_PAGES_PATH_}${pid}/${wid}`;
    DeleteFile(_url);
}
function ContentReadWorker(pid) {
    Logger.Info(`create page manipulator(readonly) to deal with pid:${pid}`);
    const _path = `${_PAGES_PATH_}${pid}/`;
    CreateFolderIfNotExist(_path);
    return {
        CreateWidgetContent: (index = Number.MAX_SAFE_INTEGER) => {
            return { id: '', type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
        },
        GetWidgetContent: _GetWidgetContent.bind(undefined, pid),
        UpdateWidgetContent: (_) => { },
        DeleteWidgetContent: (_) => { },
        GetPageContent: _GetPageContent.bind(undefined, pid),
    };
}
function ContentReadWriteWorker(pid) {
    const _path = `${_PAGES_PATH_}${pid}/`;
    Logger.Info(`ContentReadWriteWorker, path:${_path}`);
    CreateFolderIfNotExist(_path);
    return {
        CreateWidgetContent: (index = Number.MAX_SAFE_INTEGER) => {
            const _wc = { id: GenID(), type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
            const _pc = _GetPageContent(pid, false);
            index = Math.min(index, _pc.indexes.length);
            _pc.indexes[index] = _wc.id;
            _SaveConfigFile(_pc);
            return _wc;
        },
        GetWidgetContent: _GetWidgetContent.bind(undefined, pid),
        UpdateWidgetContent: _UpdateWidgetContent.bind(undefined, pid),
        DeleteWidgetContent: (wid) => {
            const _pc = _GetPageContent(pid, false);
            const _idx = _pc.indexes.indexOf(wid);
            if (_idx >= 0) {
                _pc.indexes.splice(_idx, 1);
                _SaveConfigFile(_pc);
            }
            _DeleteWidgetContent(pid, wid);
        },
        GetPageContent: _GetPageContent.bind(undefined, pid),
    };
}
function GetPageContentWorker(userType, id) {
    switch (userType) {
        case USER_TYPE.FORBIDDANCE:
        case USER_TYPE.UNKNOWN:
        case USER_TYPE.VISITOR:
            return ContentReadWorker(id);
        case USER_TYPE.EDITOR:
        case USER_TYPE.MASTER:
            return ContentReadWriteWorker(id);
    }
}

function CreateReadWorker() {
    return {
        Upload(_, cbFunc) {
            cbFunc('no rights to upload files.', undefined, undefined);
        }
    };
}
function CreateReadWriteWorker(pid) {
    return {
        Upload(req, cbFunc) {
            const form = formidable({
                multiples: true,
                allowEmptyFiles: false,
                uploadDir: `./content/pages/${pid}`,
                keepExtensions: true,
                filename: (name, ext, a, b) => {
                    return `${name}${ext}`;
                }
            });
            form.once('end', () => {
                Logger.Info('Done!');
            });
            form.on('file', (formname, file) => {
                Logger.Info('formname:', formname);
            });
            form.parse(req, cbFunc);
        }
    };
}
function GetUploadWorker(userType, pid) {
    Logger.Debug('GetUploadWorker', userType);
    switch (userType) {
        case USER_TYPE.UNKNOWN:
        case USER_TYPE.FORBIDDANCE:
            return CreateReadWorker();
        case USER_TYPE.VISITOR:
            return CreateReadWorker();
        case USER_TYPE.EDITOR:
        case USER_TYPE.MASTER:
            return pid ? CreateReadWriteWorker(pid) : CreateReadWorker();
    }
}

class Session {
    constructor(id, user) {
        this.sid = id;
        this._user = user;
    }
    GetHandleOfUpload() {
        return GetUploadWorker(this._user.type, this._pid);
    }
    GetHandleOfContent(pid) {
        return GetPageContentWorker(this._user.type, pid);
    }
    GetHandleOfProperty() {
        return GetPagePropertyWorker(this._user.type);
    }
    set pid(value) {
        this._pid = value;
    }
    get pid() {
        return this._pid;
    }
}
const _mapSession = new Map();
const _visitorSession = new Session('visitor-session-id', GetVisitor());
setInterval(_ => {
    _mapSession.forEach(sInfo => { });
    _mapSession.clear();
}, 24 * 60 * 60 * 1000);
function GetSession(sid) {
    var _a;
    if (sid) {
        return (_a = _mapSession.get(sid)) === null || _a === void 0 ? void 0 : _a.session;
    }
}
function GetVisitorSession() { return _visitorSession; }

function _Run(cProc, name, callback) {
    Logger.Info(`_Run process name:'${name}'`);
    let _stdoutStr = '';
    let _stderrStr = '';
    let _error = false;
    cProc.stdout.on('data', (data) => {
        Logger.Info(`child stdout:${data}`);
        _stdoutStr += data;
    });
    cProc.stderr.on('data', (data) => {
        _error = true;
        _stderrStr += data;
        Logger.Error(`child stderr:${data}`);
    });
    cProc.on('exit', function (code, signal) {
        if (_error) {
            callback(false, _stderrStr);
        }
        else {
            callback(true, _stdoutStr);
        }
        Logger.Info(`child process '${name}' exited with code ${code} and signal ${signal}`);
    });
    cProc.on('close', function (code, signal) {
        Logger.Info(`child process '${name}' closed with code ${code} and signal ${signal}`);
    });
    cProc.on('disconnect', function (code, signal) {
        Logger.Info(`child process '${name}' disconnect with code ${code} and signal ${signal}`);
    });
    cProc.on('message', function (code, signal) {
        Logger.Info(`child process '${name}' message with code ${code} and signal ${signal}`);
    });
}
function _RunSequence(arrProc, callback) {
    if (arrProc.length <= 0) {
        callback(RespondCode.FAIL, [], 'command list empty.');
        return;
    }
    function xxx(index) {
        if (index >= arrProc.length) {
            callback(RespondCode.OK, _outData);
            return;
        }
        const _tmp = arrProc[index];
        const _name = _tmp[0];
        const _p = node_child_process.spawn(_tmp[1], _tmp.slice(2));
        _Run(_p, _name, (ok, data) => {
            _outData[index] = data;
            if (ok) {
                xxx(++index);
            }
            else {
                callback(RespondCode.FAIL, _outData, 'command exec error.');
                return;
            }
        });
    }
    const _outData = [];
    xxx(0);
}
function Archive$1(callback) {
    Logger.Info('Archive');
    let _cb;
    {
        _cb = callback;
    }
    _RunSequence([
        ['add', 'git', 'add', '-A'],
        ['commit', 'git', 'commit', '-m', `backup from web - ${new Date().toJSON()}`],
    ], _cb);
}
var ShellCall = {
    Archive: Archive$1,
};

function GetPageList(res, session, _) {
    Logger.Debug('GetPageList', session.sid);
    session.pid = undefined;
    const _h = session.GetHandleOfProperty();
    let _data = {
        code: RespondCode.OK,
        data: _h.GetProperties(),
    };
    res.json(_data);
}
function AddPage(res, session, data) {
    Logger.Debug('AddPage', session.sid);
    const _h = session.GetHandleOfProperty();
    const _pp = _h.CreateProperty();
    if (_pp) {
        const _data = {
            code: RespondCode.OK,
            data: _pp,
        };
        res.json(_data);
    }
    else {
        Logger.Error(`property create failed`);
        const _data = {
            code: RespondCode.FAIL,
            msg: 'property create failed.',
        };
        res.json(_data);
    }
}
function UpdatePage(res, session, data) {
    Logger.Debug('UpdatePage', session.sid);
    data = data;
    const _infoBack = {
        code: RespondCode.UNKNOWN,
        data: { pid: data.data.pp.id, index: -1 },
    };
    const _h = session.GetHandleOfProperty();
    _infoBack.code = _h.UpdateProperty(data.data.pp);
    res.json(_infoBack);
}
function GetPage(res, session, data) {
    Logger.Debug('GetPage', session.sid);
    data = data;
    session.pid = data.data.id;
    const _h2 = session.GetHandleOfProperty();
    const property = _h2.GetProperty(data.data.id);
    if (property) {
        const _h = session.GetHandleOfContent(data.data.id);
        const content = _h.GetPageContent(true);
        let _data = { code: RespondCode.OK, data: { content, property } };
        res.json(_data);
    }
    else {
        let _data = { code: RespondCode.FAIL, msg: 'failed' };
        res.json(_data);
    }
}
function Login(res, session, data) {
    Logger.Debug('Login, sid:', session.sid);
    data = data;
    const _acc = data.data.account;
    const _pwd = data.data.pwd;
    const _resCode = CheckAccount(_acc, _pwd);
    if (_resCode === RespondCode.OK) {
        const _usr = GetUser(_acc);
        if (_usr) {
            const _exp = (data.data.remeberMe ? 24 : 1) * 60 * 60 + Date.now();
            res.cookie('sid', session.sid, { signed: true, expire: _exp });
        }
    }
    let _resData = {
        code: _resCode,
    };
    res.json(_resData);
}
function DeletePage(res, session, data) {
    Logger.Debug('UpdatePage', session.sid);
    data = data;
    const _h = session.GetHandleOfProperty();
    _h.DeleteProperty(data.data.id);
    let _data = { code: RespondCode.OK };
    res.json(_data);
}
function AddWidget(res, session, data) {
    Logger.Debug('AddWidget', session.sid);
    data = data;
    const _h = session.GetHandleOfContent(data.data.pid);
    let _data = {
        code: RespondCode.OK,
        data: {
            pid: data.data.pid,
            index: data.data.index,
            widgetContent: _h.CreateWidgetContent(data.data.index)
        }
    };
    if (_data.data) {
        _data.data.widgetContent.type = data.data.type;
    }
    res.json(_data);
}
function UpdateWidget(res, session, data) {
    Logger.Debug('UpdateWidget', session.sid);
    data = data;
    const _h = session.GetHandleOfContent(data.data.pid);
    let _data = {
        code: RespondCode.OK, data: { wc: _h.UpdateWidgetContent(data.data.wc) }
    };
    res.json(_data);
}
function DeleteWidget(res, session, data) {
    Logger.Debug('DeleteWidget', session.sid);
    data = data;
    const _h = session.GetHandleOfContent(data.data.pid);
    _h.DeleteWidgetContent(data.data.wid);
    let _data = { code: RespondCode.OK, data: {} };
    res.json(_data);
}
function Archive(res, session, data) {
    Logger.Debug('Archive', session.sid);
    let _data = { code: RespondCode.SHELL_CALL_ERROR, data: {} };
    ShellCall.Archive((code, data, msg) => {
        _data.code = code;
        if (msg)
            _data.msg = msg;
        res.json(_data);
    });
}
const _mapHandler = new Map();
_mapHandler.set(RequestCode.LOGIN, Login);
_mapHandler.set(RequestCode.GET_PAGE_LIST, GetPageList);
_mapHandler.set(RequestCode.GET_PAGE, GetPage);
_mapHandler.set(RequestCode.ADD_PAGE, AddPage);
_mapHandler.set(RequestCode.UPDATE_PAGE, UpdatePage);
_mapHandler.set(RequestCode.DELETE_PAGE, DeletePage);
_mapHandler.set(RequestCode.ADD_WIDGET, AddWidget);
_mapHandler.set(RequestCode.UPDATE_WIDGET, UpdateWidget);
_mapHandler.set(RequestCode.DELETE_WIDGET, DeleteWidget);
_mapHandler.set(RequestCode.ARCHIVE, Archive);
function Serve$1(req, res) {
    var _a;
    let _reqData = req.body;
    let _fn = _mapHandler.get(_reqData.code);
    if (_fn) {
        Logger.Debug('cookies is:', req.signedCookies);
        let _s = (_a = GetSession(req.signedCookies['sid'])) !== null && _a !== void 0 ? _a : GetVisitorSession();
        _fn(res, _s, _reqData);
    }
    else {
        Logger.Error(`invalid requesting code: ${_reqData.code} `);
        res.end(JSON.stringify({ code: RespondCode.QUEST_CODE_INVALID }));
    }
}

function Serve(req, res) {
    var _a;
    let _s = (_a = GetSession(req.signedCookies['sid'])) !== null && _a !== void 0 ? _a : GetVisitorSession();
    Logger.Debug('upload', _s.sid);
    const _h = _s.GetHandleOfUpload();
    _h.Upload(req, (err, fields, files) => {
        if (err) {
            Logger.Error('error');
            let _data = {
                code: RespondCode.UPLOAD_FAILED,
                data: err,
            };
            res.json(_data);
        }
        else {
            ({
                code: RespondCode.OK,
                data: { fields, files }
            });
        }
    });
}

Logger.Info("server going to start.");
const mainApp = express();
mainApp.use(compression());
mainApp.use('/', express.static(GlobalPaths.ROOT_CLIENT));
mainApp.use('/assets', express.static(`${GlobalPaths.ROOT_CONTENT}assets/`));
mainApp.use(cookieParser('singedMyCookie'));
mainApp.post("/service", bodyParser__namespace.json({ limit: "1mb" }), Serve$1);
mainApp.post('/upload', Serve);
const _PORT = 8181;
mainApp.listen(_PORT, () => Logger.Info(`SLOG HTTP server is now listening port: ${_PORT}`));
Logger.Info("server is working ...");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmJ1bmRsZS5janMiLCJzb3VyY2VzIjpbIi4uLy5idWlsZC9jb21tb24vbG9nZ2VyLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9jb3JlL2Jhc2ljLmpzIiwiLi4vLmJ1aWxkL2NvbW1vbi9tZXNzYWdlLmpzIiwiLi4vLmJ1aWxkL2NvbW1vbi9pZC1nZW5lcmF0b3IuanMiLCIuLi8uYnVpbGQvc2VydmVyL2NvcmUvZmlsZS1pby5qcyIsIi4uLy5idWlsZC9zZXJ2ZXIvY29yZS9wcml2aWxlZ2UuanMiLCIuLi8uYnVpbGQvc2VydmVyL3ZlcnNpb24tY29udHJvbC92ZXJzaW9uLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci92ZXJzaW9uLWNvbnRyb2wvdXNlci1maWxlLXVwZGF0ZXIuanMiLCIuLi8uYnVpbGQvc2VydmVyL3VzZXItbWFuYWdlci5qcyIsIi4uLy5idWlsZC9zZXJ2ZXIvdmVyc2lvbi1jb250cm9sL3N1bW1hcnktZmlsZS11cGRhdGVyLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9jb3JlL2NvbGxlY3Rpb24uanMiLCIuLi8uYnVpbGQvc2VydmVyL3N1bW1hcnktbWFuYWdlci5qcyIsIi4uLy5idWlsZC9zZXJ2ZXIvcGFnZS1wcm9wZXJ0eS13b3JrZXIuanMiLCIuLi8uYnVpbGQvY29tbW9uL3R5cGVzLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9wYWdlLWNvbnRlbnQtd29ya2VyLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9yZXNvdXJjZS11cGxvYWQtd29ya2VyLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9zZXNzaW9uLW1hbmFnZXIuanMiLCIuLi8uYnVpbGQvc2VydmVyL2NvcmUvc2hlbGwtY2FsbC5qcyIsIi4uLy5idWlsZC9zZXJ2ZXIvc2VydmljZS5qcyIsIi4uLy5idWlsZC9zZXJ2ZXIvdXBsb2FkLmpzIiwiLi4vLmJ1aWxkL3NlcnZlci9zZXJ2ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU1RBQ0tfTElORV9SRUdFWCA9IC8oXFxkKyk6KFxcZCspXFwpPyQvO1xyXG5jb25zdCBfc3lzdGVtRXJyb3IgPSBFcnJvcjtcclxuZnVuY3Rpb24gX0Vycm9yKG1zZywgcHJlZml4ID0gYFtTTE9HXWApIHtcclxuICAgIHZhciBfYTtcclxuICAgIGxldCBfbGluZU51bWJlciA9IC0xO1xyXG4gICAgY29uc3Qgc3RhY2tzID0gKF9hID0gbmV3IF9zeXN0ZW1FcnJvcigpLnN0YWNrKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3BsaXQoXCJcXFxcblwiKTtcclxuICAgIGlmIChzdGFja3MpIHtcclxuICAgICAgICBjb25zdCBfcmVzID0gU1RBQ0tfTElORV9SRUdFWC5leGVjKHN0YWNrc1syXSk7XHJcbiAgICAgICAgaWYgKF9yZXMgJiYgX3Jlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIF9saW5lTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KF9yZXNbMV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSBhdCBsaW5lOiR7X2xpbmVOdW1iZXJ9OiAke21zZ31gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBFcnJvcjogY29uc29sZS5kZWJ1Zy5iaW5kKHVuZGVmaW5lZCwgJ1tTTE9HLWVycm9yXScpLFxyXG4gICAgV2FybjogY29uc29sZS5kZWJ1Zy5iaW5kKHVuZGVmaW5lZCwgJ1tTTE9HLXdhcm5dJyksXHJcbiAgICBJbmZvOiBjb25zb2xlLmRlYnVnLmJpbmQodW5kZWZpbmVkLCAnW1NMT0ctaW5mb10nKSxcclxuICAgIERlYnVnOiBjb25zb2xlLmRlYnVnLmJpbmQodW5kZWZpbmVkLCAnW1NMT0ctZGVidWddJyksXHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvZ2dlci5qcy5tYXAiLCJpbXBvcnQgTG9nZ2VyIGZyb20gXCIuLi8uLi9jb21tb24vbG9nZ2VyXCI7XHJcbmNvbnN0IF9ST09UID0gJy4vJztcclxuZXhwb3J0IGNvbnN0IEdsb2JhbFBhdGhzID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICBST09UOiBfUk9PVCxcclxuICAgIFJPT1RfREVQTE9ZTUVOVDogX1JPT1QgKyBcIi4uL2RlcGxveW1lbnQvXCIsXHJcbiAgICBST09UX1NFUlZFUjogX1JPT1QgKyBcInNyYy9cIixcclxuICAgIFJPT1RfQ09OVEVOVDogX1JPT1QgKyBcIi4uL2RlcGxveW1lbnQvY29udGVudC9cIixcclxuICAgIFJPT1RfQ0xJRU5UOiBfUk9PVCArIFwiLi4vZGVwbG95bWVudC93d3cvXCIsXHJcbiAgICBST09UX0FTU0VUUzogX1JPT1QgKyBcIi4uL2RlcGxveW1lbnQvY29udGVudC9hc3NldHMvXCIsXHJcbn0pO1xyXG5Mb2dnZXIuSW5mbyhgcm9vdCBwYXRoIGlzOiR7R2xvYmFsUGF0aHMuUk9PVH1cclxud3d3KGNsaWVudCkgcGF0aCBpczoke0dsb2JhbFBhdGhzLlJPT1RfQ0xJRU5UfVxyXG5zZXJ2ZXIgcGF0aCBpczoke0dsb2JhbFBhdGhzLlJPT1RfU0VSVkVSfVxyXG5jb250ZW50IHBhdGggaXM6JHtHbG9iYWxQYXRocy5ST09UX0NPTlRFTlR9YCk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhc2ljLmpzLm1hcCIsImV4cG9ydCB2YXIgUmVxdWVzdENvZGU7XHJcbihmdW5jdGlvbiAoUmVxdWVzdENvZGUpIHtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiR0VUX1BBR0VfTElTVFwiXSA9IDJdID0gXCJHRVRfUEFHRV9MSVNUXCI7XHJcbiAgICBSZXF1ZXN0Q29kZVtSZXF1ZXN0Q29kZVtcIkdFVF9QQUdFXCJdID0gNl0gPSBcIkdFVF9QQUdFXCI7XHJcbiAgICBSZXF1ZXN0Q29kZVtSZXF1ZXN0Q29kZVtcIkFERF9QQUdFXCJdID0gM10gPSBcIkFERF9QQUdFXCI7XHJcbiAgICBSZXF1ZXN0Q29kZVtSZXF1ZXN0Q29kZVtcIlVQREFURV9QQUdFXCJdID0gNF0gPSBcIlVQREFURV9QQUdFXCI7XHJcbiAgICBSZXF1ZXN0Q29kZVtSZXF1ZXN0Q29kZVtcIkRFTEVURV9QQUdFXCJdID0gNV0gPSBcIkRFTEVURV9QQUdFXCI7XHJcbiAgICBSZXF1ZXN0Q29kZVtSZXF1ZXN0Q29kZVtcIkFERF9XSURHRVRcIl0gPSA3XSA9IFwiQUREX1dJREdFVFwiO1xyXG4gICAgUmVxdWVzdENvZGVbUmVxdWVzdENvZGVbXCJVUERBVEVfV0lER0VUXCJdID0gOF0gPSBcIlVQREFURV9XSURHRVRcIjtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiTU9WRV9TRUNUSU9OX0RBVEFcIl0gPSA5XSA9IFwiTU9WRV9TRUNUSU9OX0RBVEFcIjtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiREVMRVRFX1dJREdFVFwiXSA9IDEwXSA9IFwiREVMRVRFX1dJREdFVFwiO1xyXG4gICAgUmVxdWVzdENvZGVbUmVxdWVzdENvZGVbXCJHRVRfRk9MREVSX0NPTlRFTlRfSU5GT1wiXSA9IDIwXSA9IFwiR0VUX0ZPTERFUl9DT05URU5UX0lORk9cIjtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiVVBEQVRFX0VYVEVSTkFMX1dFQl9JTk5GT1wiXSA9IDMwXSA9IFwiVVBEQVRFX0VYVEVSTkFMX1dFQl9JTk5GT1wiO1xyXG4gICAgUmVxdWVzdENvZGVbUmVxdWVzdENvZGVbXCJVUExPQURfRklMRVNcIl0gPSA0MF0gPSBcIlVQTE9BRF9GSUxFU1wiO1xyXG4gICAgUmVxdWVzdENvZGVbUmVxdWVzdENvZGVbXCJMT0dJTlwiXSA9IDUwXSA9IFwiTE9HSU5cIjtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiQ0xJRU5UX1NUQVRVU1wiXSA9IDk5OF0gPSBcIkNMSUVOVF9TVEFUVVNcIjtcclxuICAgIFJlcXVlc3RDb2RlW1JlcXVlc3RDb2RlW1wiQVJDSElWRVwiXSA9IDk5OV0gPSBcIkFSQ0hJVkVcIjtcclxufSkoUmVxdWVzdENvZGUgfHwgKFJlcXVlc3RDb2RlID0ge30pKTtcclxuZXhwb3J0IHZhciBSZXNwb25kQ29kZTtcclxuKGZ1bmN0aW9uIChSZXNwb25kQ29kZSkge1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJGQUlMXCJdID0gLTFdID0gXCJGQUlMXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIkZJTEVfTk9UX0VYSVNUXCJdID0gLTJdID0gXCJGSUxFX05PVF9FWElTVFwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJBQ0NPVU5UX05PVF9FWElTVFwiXSA9IC00XSA9IFwiQUNDT1VOVF9OT1RfRVhJU1RcIjtcclxuICAgIFJlc3BvbmRDb2RlW1Jlc3BvbmRDb2RlW1wiU0VTU0lPTl9OT1RfRVhJU1RcIl0gPSAtNV0gPSBcIlNFU1NJT05fTk9UX0VYSVNUXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIlBBU1NXT1JEX0VSUk9SXCJdID0gLThdID0gXCJQQVNTV09SRF9FUlJPUlwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJQQUdFX05PVF9FWElTVFwiXSA9IC05XSA9IFwiUEFHRV9OT1RfRVhJU1RcIjtcclxuICAgIFJlc3BvbmRDb2RlW1Jlc3BvbmRDb2RlW1wiTUVUQV9BTFJFQURZX0VYSVNUXCJdID0gLTEwXSA9IFwiTUVUQV9BTFJFQURZX0VYSVNUXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIlNFQ1RJT05fQUxSRUFEWV9FWElTVFwiXSA9IC0xMV0gPSBcIlNFQ1RJT05fQUxSRUFEWV9FWElTVFwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJTRUNUSU9OX05PVF9FWElTVFwiXSA9IC0xMl0gPSBcIlNFQ1RJT05fTk9UX0VYSVNUXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIlFVRVNUX0NPREVfSU5WQUxJRFwiXSA9IC0zMF0gPSBcIlFVRVNUX0NPREVfSU5WQUxJRFwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJKU09OX1BBUlNJTkdfRVJST1JcIl0gPSAtNTBdID0gXCJKU09OX1BBUlNJTkdfRVJST1JcIjtcclxuICAgIFJlc3BvbmRDb2RlW1Jlc3BvbmRDb2RlW1wiTk9UX1BVQkxJU0hFRFwiXSA9IC0xMDBdID0gXCJOT1RfUFVCTElTSEVEXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIkZPUkJJRERFTlwiXSA9IC00MDBdID0gXCJGT1JCSURERU5cIjtcclxuICAgIFJlc3BvbmRDb2RlW1Jlc3BvbmRDb2RlW1wiU0hFTExfQ0FMTF9FUlJPUlwiXSA9IC05OTldID0gXCJTSEVMTF9DQUxMX0VSUk9SXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIklOVkFMSURfQVJHVU1FTlRcIl0gPSAtMTAwMF0gPSBcIklOVkFMSURfQVJHVU1FTlRcIjtcclxuICAgIFJlc3BvbmRDb2RlW1Jlc3BvbmRDb2RlW1wiVVBMT0FEX0ZBSUxFRFwiXSA9IC0yMDAwXSA9IFwiVVBMT0FEX0ZBSUxFRFwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJVTktOT1dfRVJST1JcIl0gPSAtOTk5OTk5XSA9IFwiVU5LTk9XX0VSUk9SXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIlVOS05PV05cIl0gPSAwXSA9IFwiVU5LTk9XTlwiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJPS1wiXSA9IDFdID0gXCJPS1wiO1xyXG4gICAgUmVzcG9uZENvZGVbUmVzcG9uZENvZGVbXCJPS19XSVRIX0lORk9cIl0gPSAyXSA9IFwiT0tfV0lUSF9JTkZPXCI7XHJcbiAgICBSZXNwb25kQ29kZVtSZXNwb25kQ29kZVtcIkhFQVJUX0JFQVRcIl0gPSA5OTk5OTldID0gXCJIRUFSVF9CRUFUXCI7XHJcbn0pKFJlc3BvbmRDb2RlIHx8IChSZXNwb25kQ29kZSA9IHt9KSk7XHJcbjtcclxuZXhwb3J0IHZhciBEYXRhVHlwZTtcclxuKGZ1bmN0aW9uIChEYXRhVHlwZSkge1xyXG4gICAgRGF0YVR5cGVbRGF0YVR5cGVbXCJBUlRJQ0xFXCJdID0gMTBdID0gXCJBUlRJQ0xFXCI7XHJcbiAgICBEYXRhVHlwZVtEYXRhVHlwZVtcIlRBR1wiXSA9IDEwXSA9IFwiVEFHXCI7XHJcbiAgICBEYXRhVHlwZVtEYXRhVHlwZVtcIk5PVEVCT09LXCJdID0gMTBdID0gXCJOT1RFQk9PS1wiO1xyXG59KShEYXRhVHlwZSB8fCAoRGF0YVR5cGUgPSB7fSkpO1xyXG5leHBvcnQgdmFyIEhpc3RvcnlBY3Rpb25UeXBlO1xyXG4oZnVuY3Rpb24gKEhpc3RvcnlBY3Rpb25UeXBlKSB7XHJcbiAgICBIaXN0b3J5QWN0aW9uVHlwZVtcIlVOS05PV05cIl0gPSBcInVua25vd25cIjtcclxuICAgIEhpc3RvcnlBY3Rpb25UeXBlW1wiTkVXXCJdID0gXCJuZXdcIjtcclxuICAgIEhpc3RvcnlBY3Rpb25UeXBlW1wiREVMRVRFXCJdID0gXCJkZWxldGVkXCI7XHJcbiAgICBIaXN0b3J5QWN0aW9uVHlwZVtcIk1PRElGSUVEXCJdID0gXCJtb2RpZmllZFwiO1xyXG59KShIaXN0b3J5QWN0aW9uVHlwZSB8fCAoSGlzdG9yeUFjdGlvblR5cGUgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBHZW5JRChwcmVmaXggPSAnaWQnKSB7XHJcbiAgICByZXR1cm4gcHJlZml4ICsgTWF0aC5yb3VuZCgoTWF0aC5yYW5kb20oKSAqIDFlMTgpKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDAsIDEwKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gR1VJRChwcmVmaXggPSBcIklEXCIpIHtcclxuICAgIHJldHVybiBgJHtwcmVmaXh9LXh4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eGAucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIHZhciByID0gKE1hdGgucmFuZG9tKCkgKiAxNikgfCAwLCB2ID0gYyA9PSBcInhcIiA/IHIgOiAociAmIDB4MykgfCAweDg7XHJcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xyXG4gICAgfSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aWQtZ2VuZXJhdG9yLmpzLm1hcCIsImltcG9ydCAqIGFzIEZTIGZyb20gJ2ZzJztcclxuZXhwb3J0IGZ1bmN0aW9uIFJlYWRGaWxlVVRGOChmaWxlVVJMLCBjYikge1xyXG4gICAgaWYgKElzRmlsZU9yRm9sZGVyRXhpc3QoZmlsZVVSTCkpIHtcclxuICAgICAgICBpZiAoY2IpIHtcclxuICAgICAgICAgICAgRlMucmVhZEZpbGUoZmlsZVVSTCwgXCJ1dGY4XCIsIChlcnIsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYihudWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gRlMucmVhZEZpbGVTeW5jKGZpbGVVUkwsIFwidXRmOFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbjtcclxuZXhwb3J0IGZ1bmN0aW9uIElzRmlsZU9yRm9sZGVyRXhpc3QoZmlsZVVSTCkge1xyXG4gICAgcmV0dXJuIEZTLmV4aXN0c1N5bmMoZmlsZVVSTCk7XHJcbn1cclxuO1xyXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlRm9sZGVySWZOb3RFeGlzdChmb2xkZXJQYXRoKSB7XHJcbiAgICBpZiAoRlMuZXhpc3RzU3luYyhmb2xkZXJQYXRoKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBGUy5ta2RpclN5bmMoZm9sZGVyUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG47XHJcbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVGb2xkZXIoZm9sZGVyUGF0aCkge1xyXG4gICAgRlMubWtkaXJTeW5jKGZvbGRlclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG59XHJcbjtcclxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZUZvbGRlcihmb2xkZXJQYXRoKSB7XHJcbiAgICBGUy5ybVN5bmMoZm9sZGVyUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIFJlYWRBbGxGaWxlTmFtZXNJbkZvbGRlcihmb2xkZXJQYXRoLCBwcmVmaXggPSBcIlwiKSB7XHJcbiAgICBsZXQgb3V0ID0gW107XHJcbiAgICBsZXQgZmlsZXMgPSBGUy5yZWFkZGlyU3luYyhmb2xkZXJQYXRoKTtcclxuICAgIGZpbGVzLm1hcChmaWxlID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlVVJMID0gZm9sZGVyUGF0aCArIGZpbGU7XHJcbiAgICAgICAgbGV0IHN0YXQgPSBGUy5zdGF0U3luYyhmaWxlVVJMKTtcclxuICAgICAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgICAgICBvdXQucHVzaChwcmVmaXggKyBmaWxlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuO1xyXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlRmlsZShmaWxlVVJMKSB7XHJcbiAgICBpZiAoSXNGaWxlT3JGb2xkZXJFeGlzdChmaWxlVVJMKSkge1xyXG4gICAgICAgIEZTLnVubGlua1N5bmMoZmlsZVVSTCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbjtcclxuZXhwb3J0IGZ1bmN0aW9uIFdyaXRlRmlsZVVURjgoZmlsZVVSTCwgZGF0YSwgZXh0ZW5zaW9uID0gXCJcIiwgY2IpIHtcclxuICAgIGlmIChjYikge1xyXG4gICAgICAgIEZTLndyaXRlRmlsZShmaWxlVVJMLCBkYXRhLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNiKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNiKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBGUy53cml0ZUZpbGVTeW5jKGZpbGVVUkwgKyBleHRlbnNpb24sIGRhdGEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1maWxlLWlvLmpzLm1hcCIsImV4cG9ydCB2YXIgUFJJVklMRUdFO1xyXG4oZnVuY3Rpb24gKFBSSVZJTEVHRSkge1xyXG4gICAgUFJJVklMRUdFW1BSSVZJTEVHRVtcIlVOS05PV05cIl0gPSAwXSA9IFwiVU5LTk9XTlwiO1xyXG4gICAgUFJJVklMRUdFW1BSSVZJTEVHRVtcIlJFQURcIl0gPSAxXSA9IFwiUkVBRFwiO1xyXG4gICAgUFJJVklMRUdFW1BSSVZJTEVHRVtcIk1PRElGWVwiXSA9IDJdID0gXCJNT0RJRllcIjtcclxuICAgIFBSSVZJTEVHRVtQUklWSUxFR0VbXCJDUkVBVEVcIl0gPSA0XSA9IFwiQ1JFQVRFXCI7XHJcbiAgICBQUklWSUxFR0VbUFJJVklMRUdFW1wiREVMRVRFXCJdID0gOF0gPSBcIkRFTEVURVwiO1xyXG59KShQUklWSUxFR0UgfHwgKFBSSVZJTEVHRSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgVVNFUl9UWVBFO1xyXG4oZnVuY3Rpb24gKFVTRVJfVFlQRSkge1xyXG4gICAgVVNFUl9UWVBFW1VTRVJfVFlQRVtcIkZPUkJJRERBTkNFXCJdID0gLTk5OTldID0gXCJGT1JCSUREQU5DRVwiO1xyXG4gICAgVVNFUl9UWVBFW1VTRVJfVFlQRVtcIlVOS05PV05cIl0gPSAwXSA9IFwiVU5LTk9XTlwiO1xyXG4gICAgVVNFUl9UWVBFW1VTRVJfVFlQRVtcIlZJU0lUT1JcIl0gPSAxXSA9IFwiVklTSVRPUlwiO1xyXG4gICAgVVNFUl9UWVBFW1VTRVJfVFlQRVtcIkVESVRPUlwiXSA9IDEwXSA9IFwiRURJVE9SXCI7XHJcbiAgICBVU0VSX1RZUEVbVVNFUl9UWVBFW1wiTUFTVEVSXCJdID0gOTk5OV0gPSBcIk1BU1RFUlwiO1xyXG59KShVU0VSX1RZUEUgfHwgKFVTRVJfVFlQRSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgQUNDRVNTSUJJTElUWTtcclxuKGZ1bmN0aW9uIChBQ0NFU1NJQklMSVRZKSB7XHJcbiAgICBBQ0NFU1NJQklMSVRZW0FDQ0VTU0lCSUxJVFlbXCJVTktOT1dOXCJdID0gMF0gPSBcIlVOS05PV05cIjtcclxuICAgIEFDQ0VTU0lCSUxJVFlbQUNDRVNTSUJJTElUWVtcIkNBTl9CRV9SRUFEXCJdID0gMV0gPSBcIkNBTl9CRV9SRUFEXCI7XHJcbiAgICBBQ0NFU1NJQklMSVRZW0FDQ0VTU0lCSUxJVFlbXCJDQU5fQkVfTU9ESUZJRURcIl0gPSAyXSA9IFwiQ0FOX0JFX01PRElGSUVEXCI7XHJcbiAgICBBQ0NFU1NJQklMSVRZW0FDQ0VTU0lCSUxJVFlbXCJDQU5fQkVfREVMRVRFRFwiXSA9IDRdID0gXCJDQU5fQkVfREVMRVRFRFwiO1xyXG59KShBQ0NFU1NJQklMSVRZIHx8IChBQ0NFU1NJQklMSVRZID0ge30pKTtcclxuZXhwb3J0IHZhciBWSVNJQklMSVRZO1xyXG4oZnVuY3Rpb24gKFZJU0lCSUxJVFkpIHtcclxuICAgIFZJU0lCSUxJVFlbVklTSUJJTElUWVtcIlVOS05PV05cIl0gPSAwXSA9IFwiVU5LTk9XTlwiO1xyXG4gICAgVklTSUJJTElUWVtWSVNJQklMSVRZW1wiSElERU5fVE9fVklTSVRPUlwiXSA9IDhdID0gXCJISURFTl9UT19WSVNJVE9SXCI7XHJcbiAgICBWSVNJQklMSVRZW1ZJU0lCSUxJVFlbXCJISURFTl9UT19FRElUT1JcIl0gPSA2NF0gPSBcIkhJREVOX1RPX0VESVRPUlwiO1xyXG59KShWSVNJQklMSVRZIHx8IChWSVNJQklMSVRZID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJpdmlsZWdlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBNYWtlVmVyc2lvbihtLCBuLCBwLCBiKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1ham9yOiBtLFxyXG4gICAgICAgIG1pbm9yOiBuLFxyXG4gICAgICAgIHBhdGNoOiBwLFxyXG4gICAgICAgIGJ1aWxkOiBiXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRWZXJzaW9uU3RyaW5nKHYsIGRldGFpbCA9IC0xKSB7XHJcbiAgICBpZiAoZGV0YWlsID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGB2JHt2Lm1ham9yfWA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChkZXRhaWwgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gYHYke3YubWFqb3J9LiR7di5taW5vcn1gO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZGV0YWlsID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuIGB2JHt2Lm1ham9yfS4ke3YubWlub3J9LiR7di5wYXRjaH1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGB2JHt2Lm1ham9yfS4ke3YubWlub3J9LiR7di5wYXRjaH0uJHt2LmJ1aWxkfWA7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmVyc2lvbi5qcy5tYXAiLCJpbXBvcnQgTG9nZ2VyIGZyb20gXCIuLi8uLi9jb21tb24vbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFBSSVZJTEVHRSwgVVNFUl9UWVBFIH0gZnJvbSBcIi4uL2NvcmUvcHJpdmlsZWdlXCI7XHJcbmltcG9ydCB7IE1ha2VWZXJzaW9uLCBHZXRWZXJzaW9uU3RyaW5nIH0gZnJvbSBcIi4vdmVyc2lvblwiO1xyXG5jb25zdCBfbmV3ZXN0VmVyc2lvbiA9IE1ha2VWZXJzaW9uKDAsIDUsIDAsIDApO1xyXG5jb25zdCBfbmV3ZXN0VmVyc2lvblN0cmluZyA9IEdldFZlcnNpb25TdHJpbmcoX25ld2VzdFZlcnNpb24sIDIpO1xyXG5mdW5jdGlvbiBVcGRhdGUoYXJyVXNlcikge1xyXG4gICAgY29uc3QgX3RtcCA9IHtcclxuICAgICAgICB2ZXJzaW9uOiBfbmV3ZXN0VmVyc2lvbixcclxuICAgICAgICB1c2VyczogW10sXHJcbiAgICB9O1xyXG4gICAgZm9yIChsZXQgaSA9IDAsIE4gPSBhcnJVc2VyLmxlbmd0aDsgaSA8IE47ICsraSkge1xyXG4gICAgICAgIF90bXAudXNlcnMucHVzaCh7XHJcbiAgICAgICAgICAgIGFjY291bnQ6IGFyclVzZXJbaV0uYWNjb3VudCxcclxuICAgICAgICAgICAgcGFzc3dvcmQ6IGFyclVzZXJbaV0ucGFzc3dvcmQsXHJcbiAgICAgICAgICAgIHR5cGU6IGFyclVzZXJbaV0udHlwZSxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGFyclVzZXJbaV0uZGlzcGxheU5hbWUsXHJcbiAgICAgICAgICAgIHByaXZpbGVnZTogYXJyVXNlcltpXS5wcml2aWxlZ2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoX3RtcCk7XHJcbn1cclxuY29uc3QgX1BhcnNlcnMgPSB7fTtcclxuX1BhcnNlcnNbR2V0VmVyc2lvblN0cmluZyhNYWtlVmVyc2lvbigwLCA1LCAwLCAwKSwgMildID0gKGlucHV0LCBvdXQpID0+IHtcclxuICAgIHZhciBfYSwgX2I7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgTiA9IGlucHV0LnVzZXJzLmxlbmd0aDsgaSA8IE47ICsraSkge1xyXG4gICAgICAgIGNvbnN0IF90bXAgPSBpbnB1dC51c2Vyc1tpXTtcclxuICAgICAgICBsZXQgX3UgPSB7XHJcbiAgICAgICAgICAgIGFjY291bnQ6IF90bXAuYWNjb3VudCxcclxuICAgICAgICAgICAgcGFzc3dvcmQ6IF90bXAucGFzc3dvcmQsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBfdG1wLmRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiAoX2EgPSBfdG1wLnR5cGUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFVTRVJfVFlQRS5WSVNJVE9SLFxyXG4gICAgICAgICAgICBwcml2aWxlZ2U6IChfYiA9IF90bXAucHJpdmlsZWdlKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBQUklWSUxFR0UuUkVBRCxcclxuICAgICAgICAgICAgcmVnaXN0VGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgb3V0LnB1c2goX3UpO1xyXG4gICAgfVxyXG59O1xyXG5mdW5jdGlvbiBQYXJzZShpbnB1dCwgb3V0KSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IF90bXAgPSBKU09OLnBhcnNlKGlucHV0KTtcclxuICAgICAgICBjb25zdCBfViA9IEdldFZlcnNpb25TdHJpbmcoX3RtcC52ZXJzaW9uLCAyKTtcclxuICAgICAgICBjb25zdCBfcGFyc2VyID0gX1BhcnNlcnNbX1ZdO1xyXG4gICAgICAgIGlmIChfcGFyc2VyKSB7XHJcbiAgICAgICAgICAgIF9wYXJzZXIoX3RtcCwgb3V0KTtcclxuICAgICAgICAgICAgaWYgKG91dC5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLkVycm9yKGB1c2Vycy5qc29uIGZpbGUgaGFzIE5PIGNvbnRlbnQsIHBsZWFzZSBhZGQgbWFudWxseS5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gX1YgIT09IF9uZXdlc3RWZXJzaW9uU3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgTG9nZ2VyLkVycm9yKCd0aGVyZSBpcyBObyBzdWNoIHBhcnNlciBmb3IgdXNlciBmaWxlIG9mIHZlcnNpb246JywgX1YpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBMb2dnZXIuRXJyb3IoJ3VzZXIgZmlsZSBwYXJzZSBlcnJvciFcXG4nLCBlKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgeyBQYXJzZSwgVXBkYXRlIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZXItZmlsZS11cGRhdGVyLmpzLm1hcCIsImltcG9ydCBMb2dnZXIgZnJvbSBcIi4uL2NvbW1vbi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgUmVzcG9uZENvZGUgfSBmcm9tIFwiLi4vY29tbW9uL21lc3NhZ2VcIjtcclxuaW1wb3J0IHsgR2xvYmFsUGF0aHMgfSBmcm9tIFwiLi9jb3JlL2Jhc2ljXCI7XHJcbmltcG9ydCAqIGFzIEZpbGVJTyBmcm9tIFwiLi9jb3JlL2ZpbGUtaW9cIjtcclxuaW1wb3J0IHsgUFJJVklMRUdFLCBVU0VSX1RZUEUgfSBmcm9tIFwiLi9jb3JlL3ByaXZpbGVnZVwiO1xyXG5pbXBvcnQgVXNlckZpbGVVcGRhdGVyIGZyb20gXCIuL3ZlcnNpb24tY29udHJvbC91c2VyLWZpbGUtdXBkYXRlclwiO1xyXG5jb25zdCBWSVNJVE9SX0lEID0gJ2lkLXZpc2l0b3InO1xyXG5jb25zdCB2aXNpdG9yID0ge1xyXG4gICAgYWNjb3VudDogVklTSVRPUl9JRCxcclxuICAgIHBhc3N3b3JkOiAnJyxcclxuICAgIHByaXZpbGVnZTogUFJJVklMRUdFLlJFQUQsXHJcbiAgICB0eXBlOiBVU0VSX1RZUEUuVklTSVRPUixcclxuICAgIGRpc3BsYXlOYW1lOiBcInZpc2l0b3JcIixcclxuICAgIHJlZ2lzdFRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxufTtcclxuZXhwb3J0IGNsYXNzIFVzZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIExvZ2dlci5JbmZvKGBVc2VyIGluZm86IGFjY291bnQtPiR7ZGF0YS5hY2NvdW50fSwgbmFtZS0+JHtkYXRhLmRpc3BsYXlOYW1lfWApO1xyXG4gICAgICAgIHRoaXMuX3VzZXJJbmZvID0gZGF0YTtcclxuICAgIH1cclxuICAgIGdldCBhY2NvdW50KCkgeyByZXR1cm4gdGhpcy5fdXNlckluZm8uYWNjb3VudDsgfVxyXG4gICAgZ2V0IGRpc3BsYXlOYW1lKCkgeyByZXR1cm4gdGhpcy5fdXNlckluZm8uZGlzcGxheU5hbWU7IH1cclxuICAgIGdldCBwcml2aWxlZ2UoKSB7IHJldHVybiB0aGlzLl91c2VySW5mby5wcml2aWxlZ2U7IH1cclxuICAgIGdldCB0eXBlKCkgeyByZXR1cm4gdGhpcy5fdXNlckluZm8udHlwZTsgfVxyXG4gICAgZ2V0IHVzZXJJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuX3VzZXJJbmZvKSk7XHJcbiAgICB9XHJcbiAgICBDaGVja1Bhc3N3b3JkKHB3ZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VySW5mby5wYXNzd29yZCA9PT0gcHdkO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IHVzZXJzID0gbmV3IE1hcCgpO1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgX3VzZXJGaWxlVVJMID0gR2xvYmFsUGF0aHMuUk9PVF9DT05URU5UICsgXCJ1c2Vycy5qc29uXCI7XHJcbiAgICBjb25zdCBfc3RyID0gRmlsZUlPLlJlYWRGaWxlVVRGOChfdXNlckZpbGVVUkwpO1xyXG4gICAgaWYgKCFfc3RyKSB7XHJcbiAgICAgICAgTG9nZ2VyLkVycm9yKGBubyB1c2Vycy5qb3NuIGZpbGUgZXhpc3QsIHBsZWFzZSBjcmVhdGUgbWFudWxseS5gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IF9hcnJVc2VyID0gW107XHJcbiAgICAgICAgaWYgKFVzZXJGaWxlVXBkYXRlci5QYXJzZShfc3RyLCBfYXJyVXNlcikpIHtcclxuICAgICAgICAgICAgRmlsZUlPLldyaXRlRmlsZVVURjgoX3VzZXJGaWxlVVJMLCBVc2VyRmlsZVVwZGF0ZXIuVXBkYXRlKF9hcnJVc2VyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfYXJyVXNlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBfTiA9IF9hcnJVc2VyLmxlbmd0aDsgaSA8IF9OOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IF9kYXRhID0gX2FyclVzZXJbaV07XHJcbiAgICAgICAgICAgICAgICB1c2Vycy5zZXQoX2RhdGEuYWNjb3VudCwgbmV3IFVzZXIoX2RhdGEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1c2Vycy5zZXQodmlzaXRvci5hY2NvdW50LCBuZXcgVXNlcih2aXNpdG9yKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBMb2dnZXIuRXJyb3IoYHVzZXJzLmpzb24gZmlsZSBoYXMgTk8gaW5mbywgcGxlYXNlIGFkZCBtYW51bGx5LmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuZXhwb3J0IGZ1bmN0aW9uIENoZWNrQWNjb3VudChhY2NvdW50LCBwd2QpIHtcclxuICAgIGlmIChhY2NvdW50ICYmIHB3ZCkge1xyXG4gICAgICAgIGxldCBfdSA9IHVzZXJzLmdldChhY2NvdW50KTtcclxuICAgICAgICBpZiAoX3UpIHtcclxuICAgICAgICAgICAgaWYgKF91LkNoZWNrUGFzc3dvcmQocHdkKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlc3BvbmRDb2RlLk9LO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlc3BvbmRDb2RlLlBBU1NXT1JEX0VSUk9SO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBSZXNwb25kQ29kZS5BQ0NPVU5UX05PVF9FWElTVDtcclxuICAgIH1cclxuICAgIHJldHVybiBSZXNwb25kQ29kZS5VTktOT1dfRVJST1I7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIEdldFVzZXIoYWNjb3VudCkge1xyXG4gICAgcmV0dXJuIHVzZXJzLmdldChhY2NvdW50KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gR2V0VmlzaXRvcigpIHtcclxuICAgIHJldHVybiBHZXRVc2VyKHZpc2l0b3IuYWNjb3VudCk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlci1tYW5hZ2VyLmpzLm1hcCIsImltcG9ydCBMb2dnZXIgZnJvbSBcIi4uLy4uL2NvbW1vbi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgR2V0VmVyc2lvblN0cmluZywgTWFrZVZlcnNpb24gfSBmcm9tIFwiLi92ZXJzaW9uXCI7XHJcbmNvbnN0IF9uZXdlc3RWZXJzaW9uID0gTWFrZVZlcnNpb24oMCwgNSwgMCwgMCk7XHJcbmNvbnN0IF9uZXdlc3RWZXJzaW9uU3RyaW5nID0gR2V0VmVyc2lvblN0cmluZyhfbmV3ZXN0VmVyc2lvbiwgMik7XHJcbmNvbnN0IF9QYXJzZXJzID0ge307XHJcbl9QYXJzZXJzW0dldFZlcnNpb25TdHJpbmcoTWFrZVZlcnNpb24oMCwgNSwgMCwgMCksIDIpXSA9IChpbnB1dCwgb3V0KSA9PiB7XHJcbiAgICB2YXIgX2EsIF9iO1xyXG4gICAgZm9yIChsZXQgaSA9IDAsIE4gPSBpbnB1dC5wYWdlcy5sZW5ndGg7IGkgPCBOOyArK2kpIHtcclxuICAgICAgICBjb25zdCBfdG1wID0gaW5wdXQucGFnZXNbaV07XHJcbiAgICAgICAgbGV0IF91ID0ge1xyXG4gICAgICAgICAgICBpZDogX3RtcC5pZCxcclxuICAgICAgICAgICAgY3JlYXRlVGltZTogX3RtcC5jcmVhdGVUaW1lLFxyXG4gICAgICAgICAgICBtb2RpZnlUaW1lOiBfdG1wLm1vZGlmeVRpbWUsXHJcbiAgICAgICAgICAgIHRpdGxlOiBfdG1wLnRpdGxlLFxyXG4gICAgICAgICAgICBhdXRob3I6ICcnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3RtcC5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgdGFnczogX3RtcC50YWdzLFxyXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtdLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgX04gPSAoX2IgPSAoX2EgPSBfdG1wLnJlc291cmNlcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IF9OOyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3QgX3IgPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBfdG1wLnJlc291cmNlc1tpXS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgZGltOiBbLi4uX3RtcC5yZXNvdXJjZXNbaV0uZGltXSxcclxuICAgICAgICAgICAgICAgIHNpemVJbkJ5dGVzOiBfdG1wLnJlc291cmNlc1tpXS5zaXplSW5CeXRlcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgX3UucmVzb3VyY2VzLnB1c2goX3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvdXQucHVzaChfdSk7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBmdW5jdGlvbiBQYXJzZShpbnB1dCwgb3V0KSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IF90bXAgPSBKU09OLnBhcnNlKGlucHV0KTtcclxuICAgICAgICBjb25zdCBfViA9IEdldFZlcnNpb25TdHJpbmcoX3RtcC52ZXJzaW9uLCAyKTtcclxuICAgICAgICBjb25zdCBfcGFyc2VyID0gX1BhcnNlcnNbX1ZdO1xyXG4gICAgICAgIGlmIChfcGFyc2VyKSB7XHJcbiAgICAgICAgICAgIF9wYXJzZXIoX3RtcCwgb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIF9WICE9PSBfbmV3ZXN0VmVyc2lvblN0cmluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5FcnJvcigndGhlcmUgaXMgTm8gc3VjaCBwYXJzZXIgZm9yIHN1bW1hcnkgZmlsZSBvZiB2ZXJzaW9uOicsIF9WKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgTG9nZ2VyLkVycm9yKCdzdW1tYXJ5IGZpbGUgcGFyc2UgZXJyb3IhXFxuJywgZSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBVcGRhdGUoaW5wdXQpIHtcclxuICAgIGNvbnN0IF90bXAgPSB7XHJcbiAgICAgICAgdmVyc2lvbjogX25ld2VzdFZlcnNpb24sXHJcbiAgICAgICAgcGFnZXM6IFtdLFxyXG4gICAgfTtcclxuICAgIGZvciAobGV0IGkgPSAwLCBOID0gaW5wdXQubGVuZ3RoOyBpIDwgTjsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgX3IgPSBpbnB1dFtpXTtcclxuICAgICAgICBjb25zdCBfcCA9IHtcclxuICAgICAgICAgICAgaWQ6IF9yLmlkLFxyXG4gICAgICAgICAgICB0aXRsZTogX3IudGl0bGUsXHJcbiAgICAgICAgICAgIGNyZWF0ZVRpbWU6IF9yLmNyZWF0ZVRpbWUsXHJcbiAgICAgICAgICAgIG1vZGlmeVRpbWU6IF9yLm1vZGlmeVRpbWUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfci5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgdGFnczogX3IudGFncyxcclxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbXSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwLCBOID0gX3IucmVzb3VyY2VzLmxlbmd0aDsgaiA8IE47ICsraikge1xyXG4gICAgICAgICAgICBjb25zdCBfdG1wID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogX3IucmVzb3VyY2VzW2pdLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBkaW06IFsuLi5fci5yZXNvdXJjZXNbal0uZGltXSxcclxuICAgICAgICAgICAgICAgIHNpemVJbkJ5dGVzOiBfci5yZXNvdXJjZXNbal0uc2l6ZUluQnl0ZXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIF9wLnJlc291cmNlcy5wdXNoKF90bXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfdG1wLnBhZ2VzLnB1c2goX3ApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KF90bXApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHsgVXBkYXRlLCBQYXJzZSB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdW1tYXJ5LWZpbGUtdXBkYXRlci5qcy5tYXAiLCJleHBvcnQgY2xhc3MgQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9hcnIgPSBbXTtcclxuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBfTW92ZVRvSW5kZXgodmFsdWUsIG9sZEluZGV4LCBuZXdJbmRleCkge1xyXG4gICAgICAgIGlmIChvbGRJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgIG5ld0luZGV4ID0gTWF0aC5tYXgoMCwgbmV3SW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAob2xkSW5kZXggPT09IG5ld0luZGV4KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZEluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLl9hcnIuc3BsaWNlKG9sZEluZGV4LCAxKTtcclxuICAgICAgICAgICAgdGhpcy5fYXJyLnNwbGljZShuZXdJbmRleCwgMCwgdmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYXJyLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBfSW5zZXJ0KHZhbHVlLCBpbmRleCkge1xyXG4gICAgICAgIGNvbnN0IF9pZHggPSB0aGlzLl9hcnIuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgaWYgKF9pZHggPj0gMClcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGluZGV4ID0gTWF0aC5tYXgoMCwgaW5kZXgpO1xyXG4gICAgICAgIHRoaXMuX2Fyci5zcGxpY2UoaW5kZXgsIDAsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLl9tYXAuc2V0KHZhbHVlLmlkLCB2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBfUmVtb3ZlKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKCF2YWx1ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IF9pID0gdGhpcy5fYXJyLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgIGlmIChfaSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fyci5zcGxpY2UoX2ksIDEpO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXAuZGVsZXRlKHZhbHVlLmlkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIEluc2VydCh2YWx1ZSwgaW5kZXggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9JbnNlcnQodmFsdWUsIGluZGV4KTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIEluc2VydEJlZm9yZSh2YWx1ZSwgRSkge1xyXG4gICAgICAgIGNvbnN0IF9pZHggPSB0aGlzLl9hcnIuaW5kZXhPZihFKTtcclxuICAgICAgICBpZiAoX2lkeCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9JbnNlcnQodmFsdWUsIF9pZHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBJbnNlcnRBZnRlcih2YWx1ZSwgRSkge1xyXG4gICAgICAgIGNvbnN0IF9pZHggPSB0aGlzLl9hcnIuaW5kZXhPZihFKTtcclxuICAgICAgICBpZiAoX2lkeCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9JbnNlcnQodmFsdWUsIF9pZHggKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgUmVtb3ZlKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX1JlbW92ZSh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBSZW1vdmVCeUtleShrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fUmVtb3ZlKHRoaXMuX21hcC5nZXQoa2V5KSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBSZW1vdmVCeUluZGV4KGluZGV4KSB7XHJcbiAgICAgICAgY29uc3QgX3ZhbHVlID0gdGhpcy5fYXJyW2luZGV4XTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fUmVtb3ZlKF92YWx1ZSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBDbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9hcnIubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLl9tYXAuY2xlYXIoKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIEdldEJ5SW5kZXgoaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXJyW2luZGV4XTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIEdldEJ5S2V5KGtleSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBJbmRleE9mKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Fyci5pbmRleE9mKHZhbHVlKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIE1vdmVUb0luZGV4KHZhbHVlLCBpbmRleCkge1xyXG4gICAgICAgIGNvbnN0IF9pbmRleCA9IHRoaXMuX2Fyci5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fTW92ZVRvSW5kZXgodmFsdWUsIF9pbmRleCwgaW5kZXgpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgTW92ZVVwKHZhbHVlKSB7XHJcbiAgICAgICAgY29uc3QgX2luZGV4ID0gdGhpcy5fYXJyLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9Nb3ZlVG9JbmRleCh2YWx1ZSwgX2luZGV4LCBfaW5kZXggLSAxKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIE1vdmVEb3duKHZhbHVlKSB7XHJcbiAgICAgICAgY29uc3QgX2luZGV4ID0gdGhpcy5fYXJyLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9Nb3ZlVG9JbmRleCh2YWx1ZSwgX2luZGV4LCBfaW5kZXggKyAxKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIEhhcyh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbHVlLmlkKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIEhhc0tleShrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmhhcyhrZXkpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgRm9yRWFjaChmbiwgdGhpc0FyZykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBOID0gdGhpcy5fYXJyLmxlbmd0aDsgaSA8IE47ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoZm4uY2FsbCh0aGlzQXJnLCB0aGlzLl9hcnJbaV0sIGkpKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgRm9yRWFjaEludmVyc2UoZm4sIHRoaXNBcmcpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fYXJyLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGlmIChmbi5jYWxsKHRoaXNBcmcsIHRoaXMuX2FycltpXSwgaSkpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBnZXQgbGVuZ3RoKCkgeyByZXR1cm4gdGhpcy5fYXJyLmxlbmd0aDsgfVxyXG4gICAgO1xyXG4gICAgRGVidWdQcmludChtc2cpIHtcclxuICAgICAgICBjb25zb2xlLmdyb3VwKG1zZyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIE4gPSB0aGlzLl9hcnIubGVuZ3RoOyBpIDwgTjsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdrZXk6JywgdGhpcy5fYXJyW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbGxlY3Rpb24uanMubWFwIiwiaW1wb3J0IHsgUmVzcG9uZENvZGUgfSBmcm9tIFwiLi4vY29tbW9uL21lc3NhZ2VcIjtcclxuaW1wb3J0IHsgR2VuSUQgfSBmcm9tIFwiLi4vY29tbW9uL2lkLWdlbmVyYXRvclwiO1xyXG5pbXBvcnQgeyBHbG9iYWxQYXRocyB9IGZyb20gXCIuL2NvcmUvYmFzaWNcIjtcclxuaW1wb3J0ICogYXMgRmlsZUlPIGZyb20gXCIuL2NvcmUvZmlsZS1pb1wiO1xyXG5pbXBvcnQgU3VtbWFyeUZpbGVVcGRhdGVyIGZyb20gXCIuL3ZlcnNpb24tY29udHJvbC9zdW1tYXJ5LWZpbGUtdXBkYXRlclwiO1xyXG5pbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSBcIi4vY29yZS9jb2xsZWN0aW9uXCI7XHJcbmNvbnN0IF9zdW1tYXJ5RmlsZVVSTCA9IGAke0dsb2JhbFBhdGhzLlJPT1RfQ09OVEVOVH1wYWdlcy9zdW1tYXJ5Lmpzb25gO1xyXG5jb25zdCBfcGFnZUNvbGxlY3Rpb24gPSBuZXcgQ29sbGVjdGlvbigpO1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgX3RtcCA9IEZpbGVJTy5SZWFkRmlsZVVURjgoX3N1bW1hcnlGaWxlVVJMKTtcclxuICAgIGlmIChfdG1wKSB7XHJcbiAgICAgICAgY29uc3QgX291dHB1dCA9IFtdO1xyXG4gICAgICAgIGlmIChTdW1tYXJ5RmlsZVVwZGF0ZXIuUGFyc2UoX3RtcCwgX291dHB1dCkpIHtcclxuICAgICAgICAgICAgU2F2ZVRvRGlzayhfb3V0cHV0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIE4gPSBfb3V0cHV0Lmxlbmd0aDsgaSA8IE47ICsraSkge1xyXG4gICAgICAgICAgICBfcGFnZUNvbGxlY3Rpb24uSW5zZXJ0KF9vdXRwdXRbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuZnVuY3Rpb24gU2F2ZVRvRGlzayhpbnB1dCkge1xyXG4gICAgRmlsZUlPLldyaXRlRmlsZVVURjgoX3N1bW1hcnlGaWxlVVJMLCBTdW1tYXJ5RmlsZVVwZGF0ZXIuVXBkYXRlKGlucHV0ICE9PSBudWxsICYmIGlucHV0ICE9PSB2b2lkIDAgPyBpbnB1dCA6IEdldFByb3BlcnRpZXMoKSkpO1xyXG59XHJcbmZ1bmN0aW9uIEdldFByb3BlcnR5KGlkKSB7XHJcbiAgICBjb25zdCBfcHAgPSBfcGFnZUNvbGxlY3Rpb24uR2V0QnlLZXkoaWQpO1xyXG4gICAgaWYgKF9wcCkge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KF9wcCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5mdW5jdGlvbiBHZXRQcm9wZXJ0aWVzKCkge1xyXG4gICAgY29uc3QgX291dCA9IFtdO1xyXG4gICAgX3BhZ2VDb2xsZWN0aW9uLkZvckVhY2goKHYsIF8pID0+IHtcclxuICAgICAgICBfb3V0LnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2KSkpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sIHVuZGVmaW5lZCk7XHJcbiAgICByZXR1cm4gX291dDtcclxufVxyXG5mdW5jdGlvbiBNb2RpZnlQcm9wZXJ0eShwcCkge1xyXG4gICAgY29uc3QgX3BwID0gX3BhZ2VDb2xsZWN0aW9uLkdldEJ5S2V5KHBwLmlkKTtcclxuICAgIGlmIChfcHApIHtcclxuICAgICAgICBfcHAuY3JlYXRlVGltZSA9IHBwLmNyZWF0ZVRpbWU7XHJcbiAgICAgICAgX3BwLm1vZGlmeVRpbWUgPSBwcC5tb2RpZnlUaW1lO1xyXG4gICAgICAgIF9wcC50aXRsZSA9IHBwLnRpdGxlO1xyXG4gICAgICAgIF9wcC5hdXRob3IgPSBwcC5hdXRob3I7XHJcbiAgICAgICAgX3BwLmRlc2NyaXB0aW9uID0gcHAuZGVzY3JpcHRpb247XHJcbiAgICAgICAgX3BwLnRhZ3MgPSBwcC50YWdzO1xyXG4gICAgICAgIHJldHVybiBSZXNwb25kQ29kZS5PSztcclxuICAgIH1cclxuICAgIHJldHVybiBSZXNwb25kQ29kZS5QQUdFX05PVF9FWElTVDtcclxufVxyXG5mdW5jdGlvbiBEZWxldGVQcm9wZXJ0eShpZCkge1xyXG4gICAgcmV0dXJuIF9wYWdlQ29sbGVjdGlvbi5SZW1vdmVCeUtleShpZCk7XHJcbn1cclxuZnVuY3Rpb24gQ3JlYXRlUHJvcGVydHkoKSB7XHJcbiAgICBjb25zdCBfcHAgPSB7XHJcbiAgICAgICAgaWQ6IEdlbklEKCksXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNyZWF0ZVRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICBtb2RpZnlUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgdGl0bGU6IG5ldyBEYXRlKCkudG9TdHJpbmcoKSxcclxuICAgICAgICBhdXRob3I6ICcnLFxyXG4gICAgICAgIHRhZ3M6ICcnLFxyXG4gICAgICAgIHJlc291cmNlczogW10sXHJcbiAgICB9O1xyXG4gICAgX3BhZ2VDb2xsZWN0aW9uLkluc2VydChfcHAsIC0xKTtcclxuICAgIHJldHVybiBfcHA7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgeyBHZXRQcm9wZXJ0eSwgR2V0UHJvcGVydGllcywgTW9kaWZ5UHJvcGVydHksIERlbGV0ZVByb3BlcnR5LCBDcmVhdGVQcm9wZXJ0eSwgU2F2ZVRvRGlzayB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdW1tYXJ5LW1hbmFnZXIuanMubWFwIiwiaW1wb3J0IHsgUmVzcG9uZENvZGUgfSBmcm9tIFwiLi4vY29tbW9uL21lc3NhZ2VcIjtcclxuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi4vY29tbW9uL2xvZ2dlclwiO1xyXG5pbXBvcnQgeyBVU0VSX1RZUEUgfSBmcm9tIFwiLi9jb3JlL3ByaXZpbGVnZVwiO1xyXG5pbXBvcnQgU3VtbWFyeU1hbmFnZXIgZnJvbSBcIi4vc3VtbWFyeS1tYW5hZ2VyXCI7XHJcbmZ1bmN0aW9uIENyZWF0ZVJlYWRXb3JrZXIoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIEdldFByb3BlcnR5OiBTdW1tYXJ5TWFuYWdlci5HZXRQcm9wZXJ0eSxcclxuICAgICAgICBHZXRQcm9wZXJ0aWVzOiBTdW1tYXJ5TWFuYWdlci5HZXRQcm9wZXJ0aWVzLFxyXG4gICAgICAgIFVwZGF0ZVByb3BlcnR5KF8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlc3BvbmRDb2RlLkZPUkJJRERFTjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIERlbGV0ZVByb3BlcnR5OiAoXykgPT4ge1xyXG4gICAgICAgICAgICBMb2dnZXIuSW5mbyhgdmlzaXRvciBjYW4gbm90IGRlbGV0ZSBwYWdlYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIENyZWF0ZVByb3BlcnR5OiAoKSA9PiB7XHJcbiAgICAgICAgICAgIExvZ2dlci5JbmZvKGB2aXNpdG9yIGNhbiBub3QgY3JlYXRlIHBhZ2VgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBDcmVhdGVSZWFkV3JpdGVXb3JrZXIoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIEdldFByb3BlcnR5OiBTdW1tYXJ5TWFuYWdlci5HZXRQcm9wZXJ0eSxcclxuICAgICAgICBHZXRQcm9wZXJ0aWVzOiBTdW1tYXJ5TWFuYWdlci5HZXRQcm9wZXJ0aWVzLFxyXG4gICAgICAgIFVwZGF0ZVByb3BlcnR5KHBwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IF9jb2RlID0gU3VtbWFyeU1hbmFnZXIuTW9kaWZ5UHJvcGVydHkocHApO1xyXG4gICAgICAgICAgICBpZiAoX2NvZGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBTdW1tYXJ5TWFuYWdlci5TYXZlVG9EaXNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIF9jb2RlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgRGVsZXRlUHJvcGVydHk6IChpZCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBfb3V0ID0gU3VtbWFyeU1hbmFnZXIuRGVsZXRlUHJvcGVydHkoaWQpO1xyXG4gICAgICAgICAgICBfb3V0ICYmIFN1bW1hcnlNYW5hZ2VyLlNhdmVUb0Rpc2soKTtcclxuICAgICAgICAgICAgcmV0dXJuIF9vdXQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBDcmVhdGVQcm9wZXJ0eTogU3VtbWFyeU1hbmFnZXIuQ3JlYXRlUHJvcGVydHksXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRQYWdlUHJvcGVydHlXb3JrZXIodXNlclR5cGUpIHtcclxuICAgIExvZ2dlci5EZWJ1ZygnR2V0UGFnZVByb3BlcnR5V29ya2VyJywgdXNlclR5cGUpO1xyXG4gICAgc3dpdGNoICh1c2VyVHlwZSkge1xyXG4gICAgICAgIGNhc2UgVVNFUl9UWVBFLlVOS05PV046XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuRk9SQklEREFOQ0U6XHJcbiAgICAgICAgICAgIHJldHVybiBDcmVhdGVSZWFkV29ya2VyKCk7XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuVklTSVRPUjpcclxuICAgICAgICAgICAgcmV0dXJuIENyZWF0ZVJlYWRXb3JrZXIoKTtcclxuICAgICAgICBjYXNlIFVTRVJfVFlQRS5FRElUT1I6XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuTUFTVEVSOlxyXG4gICAgICAgICAgICByZXR1cm4gQ3JlYXRlUmVhZFdyaXRlV29ya2VyKCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZS1wcm9wZXJ0eS13b3JrZXIuanMubWFwIiwiZXhwb3J0IHZhciBQQU5FX1RZUEU7XHJcbihmdW5jdGlvbiAoUEFORV9UWVBFKSB7XHJcbiAgICBQQU5FX1RZUEVbXCJVTktOT1dOXCJdID0gXCJ1bmtub3duXCI7XHJcbiAgICBQQU5FX1RZUEVbXCJDT05URU5UXCJdID0gXCJjb250ZW50XCI7XHJcbiAgICBQQU5FX1RZUEVbXCJMQVlPVVRcIl0gPSBcImxheW91dFwiO1xyXG4gICAgUEFORV9UWVBFW1wiQUNUSU9OXCJdID0gXCJhY3Rpb25cIjtcclxufSkoUEFORV9UWVBFIHx8IChQQU5FX1RZUEUgPSB7fSkpO1xyXG5leHBvcnQgY29uc3QgV0lER0VUX0lDT05fU0laRSA9IDE2O1xyXG5leHBvcnQgY29uc3QgV0lER0VUX01JTl9IRUlHSFQgPSAyMDA7XHJcbmV4cG9ydCB2YXIgV0lER0VUX1NUQVRFO1xyXG4oZnVuY3Rpb24gKFdJREdFVF9TVEFURSkge1xyXG4gICAgV0lER0VUX1NUQVRFW1dJREdFVF9TVEFURVtcIkVESVRPUlwiXSA9IC0xXSA9IFwiRURJVE9SXCI7XHJcbiAgICBXSURHRVRfU1RBVEVbV0lER0VUX1NUQVRFW1wiVU5LTk9XTlwiXSA9IDBdID0gXCJVTktOT1dOXCI7XHJcbiAgICBXSURHRVRfU1RBVEVbV0lER0VUX1NUQVRFW1wiVklFV1wiXSA9IDFdID0gXCJWSUVXXCI7XHJcbn0pKFdJREdFVF9TVEFURSB8fCAoV0lER0VUX1NUQVRFID0ge30pKTtcclxuZXhwb3J0IHZhciBXSURHRVRfVFlQRTtcclxuKGZ1bmN0aW9uIChXSURHRVRfVFlQRSkge1xyXG4gICAgV0lER0VUX1RZUEVbXCJVTktOT1dOXCJdID0gXCJ1bmtub3duXCI7XHJcbiAgICBXSURHRVRfVFlQRVtcIlBBR0VfTkVXXCJdID0gXCJwYWdlX25ld1wiO1xyXG4gICAgV0lER0VUX1RZUEVbXCJQUk9QRVJUWVwiXSA9IFwicHJvcGVydHlcIjtcclxuICAgIFdJREdFVF9UWVBFW1wiTUFSS0RPV05cIl0gPSBcIm1hcmtkb3duXCI7XHJcbiAgICBXSURHRVRfVFlQRVtcIkNVU1RPTVwiXSA9IFwiY3VzdG9tXCI7XHJcbiAgICBXSURHRVRfVFlQRVtcIlRFTVBMQVRFXCJdID0gXCJ0ZW1wbGF0ZVwiO1xyXG59KShXSURHRVRfVFlQRSB8fCAoV0lER0VUX1RZUEUgPSB7fSkpO1xyXG5leHBvcnQgdmFyIFdJREdFVF9BQ1RJT047XHJcbihmdW5jdGlvbiAoV0lER0VUX0FDVElPTikge1xyXG4gICAgV0lER0VUX0FDVElPTltXSURHRVRfQUNUSU9OW1wiTk9ORVwiXSA9IDBdID0gXCJOT05FXCI7XHJcbiAgICBXSURHRVRfQUNUSU9OW1dJREdFVF9BQ1RJT05bXCJORVdcIl0gPSAxXSA9IFwiTkVXXCI7XHJcbiAgICBXSURHRVRfQUNUSU9OW1dJREdFVF9BQ1RJT05bXCJUT0dHTEVcIl0gPSAyXSA9IFwiVE9HR0xFXCI7XHJcbiAgICBXSURHRVRfQUNUSU9OW1dJREdFVF9BQ1RJT05bXCJQUkVWSUVXXCJdID0gNF0gPSBcIlBSRVZJRVdcIjtcclxuICAgIFdJREdFVF9BQ1RJT05bV0lER0VUX0FDVElPTltcIlNBVkVcIl0gPSA4XSA9IFwiU0FWRVwiO1xyXG4gICAgV0lER0VUX0FDVElPTltXSURHRVRfQUNUSU9OW1wiREVMRVRFXCJdID0gMTZdID0gXCJERUxFVEVcIjtcclxuICAgIFdJREdFVF9BQ1RJT05bV0lER0VUX0FDVElPTltcIlNBVkVfVEVNUExBVEVcIl0gPSAxMjhdID0gXCJTQVZFX1RFTVBMQVRFXCI7XHJcbn0pKFdJREdFVF9BQ1RJT04gfHwgKFdJREdFVF9BQ1RJT04gPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJpbXBvcnQgeyBXSURHRVRfVFlQRSB9IGZyb20gXCIuLi9jb21tb24vdHlwZXNcIjtcclxuaW1wb3J0IHsgR2VuSUQgfSBmcm9tIFwiLi4vY29tbW9uL2lkLWdlbmVyYXRvclwiO1xyXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuLi9jb21tb24vbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFVTRVJfVFlQRSB9IGZyb20gXCIuL2NvcmUvcHJpdmlsZWdlXCI7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSBcIi4vY29yZS9iYXNpY1wiO1xyXG5pbXBvcnQgKiBhcyBGaWxlSU8gZnJvbSBcIi4vY29yZS9maWxlLWlvXCI7XHJcbmNvbnN0IF9QQUdFU19QQVRIXyA9IGAke0dsb2JhbFBhdGhzLlJPT1RfQ09OVEVOVH1wYWdlcy9gO1xyXG5leHBvcnQgdmFyIGNvbnRlbnRfZmxhZztcclxuKGZ1bmN0aW9uIChjb250ZW50X2ZsYWcpIHtcclxuICAgIGNvbnRlbnRfZmxhZ1tjb250ZW50X2ZsYWdbXCJjb25maWdcIl0gPSAwXSA9IFwiY29uZmlnXCI7XHJcbn0pKGNvbnRlbnRfZmxhZyB8fCAoY29udGVudF9mbGFnID0ge30pKTtcclxuY29uc3QgX1RFTVBMQVRFX0NPTkZJR18gPSB7XHJcbiAgICBpZDogJycsXHJcbiAgICBpbmRleGVzOiBbXSxcclxuICAgIHNlY3Rpb25zOiB7fSxcclxufTtcclxuZnVuY3Rpb24gX1NhdmVDb25maWdGaWxlKHBjKSB7XHJcbiAgICBjb25zdCBfZGF0YSA9IHtcclxuICAgICAgICBpZDogcGMuaWQsXHJcbiAgICAgICAgaW5kZXhlczogWy4uLnBjLmluZGV4ZXNdLFxyXG4gICAgICAgIHNlY3Rpb25zOiB7fSxcclxuICAgIH07XHJcbiAgICBGaWxlSU8uV3JpdGVGaWxlVVRGOChgJHtfUEFHRVNfUEFUSF99JHtwYy5pZH0vY29uZmlnLmpzb25gLCBKU09OLnN0cmluZ2lmeShfZGF0YSkpO1xyXG59XHJcbmZ1bmN0aW9uIF9HZXRXaWRnZXRDb250ZW50KHBpZCwgd2lkKSB7XHJcbiAgICBjb25zdCBfc3RyID0gRmlsZUlPLlJlYWRGaWxlVVRGOChgJHtfUEFHRVNfUEFUSF99JHtwaWR9LyR7d2lkfWApO1xyXG4gICAgaWYgKF9zdHIpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgX29iaiA9IEpTT04ucGFyc2UoX3N0cik7XHJcbiAgICAgICAgICAgIHJldHVybiBfb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBMb2dnZXIuRXJyb3IoYGpzb24gcGFyc2luZyBlcnJvcmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7IGlkOiAnJywgdHlwZTogV0lER0VUX1RZUEUuVU5LTk9XTiwgZGF0YTogeyBjb250ZW50OiAnJywgbGF5b3V0OiAnJywgYWN0aW9uOiBcIlwiIH0gfTtcclxufVxyXG5mdW5jdGlvbiBfR2V0UGFnZUNvbnRlbnQocGlkLCB3aXRoV2lkZ2V0Q29udGVudCkge1xyXG4gICAgY29uc3QgX291dCA9IEZpbGVJTy5SZWFkRmlsZVVURjgoYCR7X1BBR0VTX1BBVEhffSR7cGlkfS9jb25maWcuanNvbmApO1xyXG4gICAgaWYgKF9vdXQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBfcGMgPSBKU09OLnBhcnNlKF9vdXQpO1xyXG4gICAgICAgICAgICBpZiAod2l0aFdpZGdldENvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBOID0gX3BjLmluZGV4ZXMubGVuZ3RoOyBpIDwgTjsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2lkID0gX3BjLmluZGV4ZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgX3BjLnNlY3Rpb25zW19pZF0gPSBfR2V0V2lkZ2V0Q29udGVudChwaWQsIF9pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIF9wYztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgTG9nZ2VyLkVycm9yKGBqc29uIHBhcnNpbmcgZXJyb3JgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBfcGMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KF9URU1QTEFURV9DT05GSUdfKSk7XHJcbiAgICBfcGMuaWQgPSBwaWQ7XHJcbiAgICBfU2F2ZUNvbmZpZ0ZpbGUoX3BjKTtcclxuICAgIHJldHVybiBfcGM7XHJcbn1cclxuZnVuY3Rpb24gX1VwZGF0ZVdpZGdldENvbnRlbnQocGlkLCB3Yykge1xyXG4gICAgY29uc3QgX3VybCA9IGAke19QQUdFU19QQVRIX30ke3BpZH0vJHt3Yy5pZH1gO1xyXG4gICAgRmlsZUlPLldyaXRlRmlsZVVURjgoX3VybCwgSlNPTi5zdHJpbmdpZnkod2MpKTtcclxufVxyXG5mdW5jdGlvbiBfRGVsZXRlV2lkZ2V0Q29udGVudChwaWQsIHdpZCkge1xyXG4gICAgY29uc3QgX3VybCA9IGAke19QQUdFU19QQVRIX30ke3BpZH0vJHt3aWR9YDtcclxuICAgIEZpbGVJTy5EZWxldGVGaWxlKF91cmwpO1xyXG59XHJcbmZ1bmN0aW9uIENvbnRlbnRSZWFkV29ya2VyKHBpZCkge1xyXG4gICAgTG9nZ2VyLkluZm8oYGNyZWF0ZSBwYWdlIG1hbmlwdWxhdG9yKHJlYWRvbmx5KSB0byBkZWFsIHdpdGggcGlkOiR7cGlkfWApO1xyXG4gICAgY29uc3QgX3BhdGggPSBgJHtfUEFHRVNfUEFUSF99JHtwaWR9L2A7XHJcbiAgICBGaWxlSU8uQ3JlYXRlRm9sZGVySWZOb3RFeGlzdChfcGF0aCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIENyZWF0ZVdpZGdldENvbnRlbnQ6IChpbmRleCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7IGlkOiAnJywgdHlwZTogV0lER0VUX1RZUEUuVU5LTk9XTiwgZGF0YTogeyBjb250ZW50OiAnJywgbGF5b3V0OiAnJywgYWN0aW9uOiBcIlwiIH0gfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIEdldFdpZGdldENvbnRlbnQ6IF9HZXRXaWRnZXRDb250ZW50LmJpbmQodW5kZWZpbmVkLCBwaWQpLFxyXG4gICAgICAgIFVwZGF0ZVdpZGdldENvbnRlbnQ6IChfKSA9PiB7IH0sXHJcbiAgICAgICAgRGVsZXRlV2lkZ2V0Q29udGVudDogKF8pID0+IHsgfSxcclxuICAgICAgICBHZXRQYWdlQ29udGVudDogX0dldFBhZ2VDb250ZW50LmJpbmQodW5kZWZpbmVkLCBwaWQpLFxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBDb250ZW50UmVhZFdyaXRlV29ya2VyKHBpZCkge1xyXG4gICAgY29uc3QgX3BhdGggPSBgJHtfUEFHRVNfUEFUSF99JHtwaWR9L2A7XHJcbiAgICBMb2dnZXIuSW5mbyhgQ29udGVudFJlYWRXcml0ZVdvcmtlciwgcGF0aDoke19wYXRofWApO1xyXG4gICAgRmlsZUlPLkNyZWF0ZUZvbGRlcklmTm90RXhpc3QoX3BhdGgpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBDcmVhdGVXaWRnZXRDb250ZW50OiAoaW5kZXggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBfd2MgPSB7IGlkOiBHZW5JRCgpLCB0eXBlOiBXSURHRVRfVFlQRS5VTktOT1dOLCBkYXRhOiB7IGNvbnRlbnQ6ICcnLCBsYXlvdXQ6ICcnLCBhY3Rpb246IFwiXCIgfSB9O1xyXG4gICAgICAgICAgICBjb25zdCBfcGMgPSBfR2V0UGFnZUNvbnRlbnQocGlkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIF9wYy5pbmRleGVzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIF9wYy5pbmRleGVzW2luZGV4XSA9IF93Yy5pZDtcclxuICAgICAgICAgICAgX1NhdmVDb25maWdGaWxlKF9wYyk7XHJcbiAgICAgICAgICAgIHJldHVybiBfd2M7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBHZXRXaWRnZXRDb250ZW50OiBfR2V0V2lkZ2V0Q29udGVudC5iaW5kKHVuZGVmaW5lZCwgcGlkKSxcclxuICAgICAgICBVcGRhdGVXaWRnZXRDb250ZW50OiBfVXBkYXRlV2lkZ2V0Q29udGVudC5iaW5kKHVuZGVmaW5lZCwgcGlkKSxcclxuICAgICAgICBEZWxldGVXaWRnZXRDb250ZW50OiAod2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IF9wYyA9IF9HZXRQYWdlQ29udGVudChwaWQsIGZhbHNlKTtcclxuICAgICAgICAgICAgY29uc3QgX2lkeCA9IF9wYy5pbmRleGVzLmluZGV4T2Yod2lkKTtcclxuICAgICAgICAgICAgaWYgKF9pZHggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgX3BjLmluZGV4ZXMuc3BsaWNlKF9pZHgsIDEpO1xyXG4gICAgICAgICAgICAgICAgX1NhdmVDb25maWdGaWxlKF9wYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX0RlbGV0ZVdpZGdldENvbnRlbnQocGlkLCB3aWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgR2V0UGFnZUNvbnRlbnQ6IF9HZXRQYWdlQ29udGVudC5iaW5kKHVuZGVmaW5lZCwgcGlkKSxcclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIEdldFBhZ2VDb250ZW50V29ya2VyKHVzZXJUeXBlLCBpZCkge1xyXG4gICAgc3dpdGNoICh1c2VyVHlwZSkge1xyXG4gICAgICAgIGNhc2UgVVNFUl9UWVBFLkZPUkJJRERBTkNFOlxyXG4gICAgICAgIGNhc2UgVVNFUl9UWVBFLlVOS05PV046XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuVklTSVRPUjpcclxuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnRSZWFkV29ya2VyKGlkKTtcclxuICAgICAgICBjYXNlIFVTRVJfVFlQRS5FRElUT1I6XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuTUFTVEVSOlxyXG4gICAgICAgICAgICByZXR1cm4gQ29udGVudFJlYWRXcml0ZVdvcmtlcihpZCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZS1jb250ZW50LXdvcmtlci5qcy5tYXAiLCJpbXBvcnQgZm9ybWlkYWJsZSBmcm9tICdmb3JtaWRhYmxlJztcclxuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi4vY29tbW9uL2xvZ2dlclwiO1xyXG5pbXBvcnQgeyBVU0VSX1RZUEUgfSBmcm9tIFwiLi9jb3JlL3ByaXZpbGVnZVwiO1xyXG5mdW5jdGlvbiBDcmVhdGVSZWFkV29ya2VyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBVcGxvYWQoXywgY2JGdW5jKSB7XHJcbiAgICAgICAgICAgIGNiRnVuYygnbm8gcmlnaHRzIHRvIHVwbG9hZCBmaWxlcy4nLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBDcmVhdGVSZWFkV3JpdGVXb3JrZXIocGlkKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIFVwbG9hZChyZXEsIGNiRnVuYykge1xyXG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZm9ybWlkYWJsZSh7XHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhbGxvd0VtcHR5RmlsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdXBsb2FkRGlyOiBgLi9jb250ZW50L3BhZ2VzLyR7cGlkfWAsXHJcbiAgICAgICAgICAgICAgICBrZWVwRXh0ZW5zaW9uczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiAobmFtZSwgZXh0LCBhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke25hbWV9JHtleHR9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGZvcm0ub25jZSgnZW5kJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLkluZm8oJ0RvbmUhJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBmb3JtLm9uKCdmaWxlJywgKGZvcm1uYW1lLCBmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuSW5mbygnZm9ybW5hbWU6JywgZm9ybW5hbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZm9ybS5wYXJzZShyZXEsIGNiRnVuYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gR2V0VXBsb2FkV29ya2VyKHVzZXJUeXBlLCBwaWQpIHtcclxuICAgIExvZ2dlci5EZWJ1ZygnR2V0VXBsb2FkV29ya2VyJywgdXNlclR5cGUpO1xyXG4gICAgc3dpdGNoICh1c2VyVHlwZSkge1xyXG4gICAgICAgIGNhc2UgVVNFUl9UWVBFLlVOS05PV046XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuRk9SQklEREFOQ0U6XHJcbiAgICAgICAgICAgIHJldHVybiBDcmVhdGVSZWFkV29ya2VyKCk7XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuVklTSVRPUjpcclxuICAgICAgICAgICAgcmV0dXJuIENyZWF0ZVJlYWRXb3JrZXIoKTtcclxuICAgICAgICBjYXNlIFVTRVJfVFlQRS5FRElUT1I6XHJcbiAgICAgICAgY2FzZSBVU0VSX1RZUEUuTUFTVEVSOlxyXG4gICAgICAgICAgICByZXR1cm4gcGlkID8gQ3JlYXRlUmVhZFdyaXRlV29ya2VyKHBpZCkgOiBDcmVhdGVSZWFkV29ya2VyKCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzb3VyY2UtdXBsb2FkLXdvcmtlci5qcy5tYXAiLCJpbXBvcnQgeyBHZW5JRCB9IGZyb20gXCIuLi9jb21tb24vaWQtZ2VuZXJhdG9yXCI7XHJcbmltcG9ydCB7IEdldFZpc2l0b3IgfSBmcm9tIFwiLi91c2VyLW1hbmFnZXJcIjtcclxuaW1wb3J0ICogYXMgUHJvcGVydHlXb3JrZXIgZnJvbSBcIi4vcGFnZS1wcm9wZXJ0eS13b3JrZXJcIjtcclxuaW1wb3J0ICogYXMgQ29udGVudFdvcmtlciBmcm9tIFwiLi9wYWdlLWNvbnRlbnQtd29ya2VyXCI7XHJcbmltcG9ydCAqIGFzIFVwbG9hZFdvcmtlciBmcm9tIFwiLi9yZXNvdXJjZS11cGxvYWQtd29ya2VyXCI7XHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKGlkLCB1c2VyKSB7XHJcbiAgICAgICAgdGhpcy5zaWQgPSBpZDtcclxuICAgICAgICB0aGlzLl91c2VyID0gdXNlcjtcclxuICAgIH1cclxuICAgIEdldEhhbmRsZU9mVXBsb2FkKCkge1xyXG4gICAgICAgIHJldHVybiBVcGxvYWRXb3JrZXIuR2V0VXBsb2FkV29ya2VyKHRoaXMuX3VzZXIudHlwZSwgdGhpcy5fcGlkKTtcclxuICAgIH1cclxuICAgIEdldEhhbmRsZU9mQ29udGVudChwaWQpIHtcclxuICAgICAgICByZXR1cm4gQ29udGVudFdvcmtlci5HZXRQYWdlQ29udGVudFdvcmtlcih0aGlzLl91c2VyLnR5cGUsIHBpZCk7XHJcbiAgICB9XHJcbiAgICBHZXRIYW5kbGVPZlByb3BlcnR5KCkge1xyXG4gICAgICAgIHJldHVybiBQcm9wZXJ0eVdvcmtlci5HZXRQYWdlUHJvcGVydHlXb3JrZXIodGhpcy5fdXNlci50eXBlKTtcclxuICAgIH1cclxuICAgIHNldCBwaWQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9waWQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBwaWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BpZDtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBDcmVhdGVTZXNzaW9uSW5mbyhzLCB1c2VyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNyZWF0ZVRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICBsYXN0U3luY1RpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICBzZXNzaW9uOiBzLFxyXG4gICAgICAgIHVzZXIsXHJcbiAgICB9O1xyXG59XHJcbmNvbnN0IF9tYXBTZXNzaW9uID0gbmV3IE1hcCgpO1xyXG5jb25zdCBfdmlzaXRvclNlc3Npb24gPSBuZXcgU2Vzc2lvbigndmlzaXRvci1zZXNzaW9uLWlkJywgR2V0VmlzaXRvcigpKTtcclxuc2V0SW50ZXJ2YWwoXyA9PiB7XHJcbiAgICBfbWFwU2Vzc2lvbi5mb3JFYWNoKHNJbmZvID0+IHsgfSk7XHJcbiAgICBfbWFwU2Vzc2lvbi5jbGVhcigpO1xyXG59LCAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuZXhwb3J0IGZ1bmN0aW9uIEdldFNlc3Npb24oc2lkKSB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICBpZiAoc2lkKSB7XHJcbiAgICAgICAgcmV0dXJuIChfYSA9IF9tYXBTZXNzaW9uLmdldChzaWQpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc2Vzc2lvbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gR2V0VmlzaXRvclNlc3Npb24oKSB7IHJldHVybiBfdmlzaXRvclNlc3Npb247IH1cclxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVNlc3Npb24oc2lkKSB7XHJcbiAgICBjb25zdCBfc0luZm8gPSBfbWFwU2Vzc2lvbi5nZXQoc2lkKTtcclxuICAgIGlmIChfc0luZm8pIHtcclxuICAgICAgICBfbWFwU2Vzc2lvbi5kZWxldGUoc2lkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlU2Vzc2lvbih1c2VyKSB7XHJcbiAgICBjb25zdCBfcyA9IG5ldyBTZXNzaW9uKEdlbklEKCksIHVzZXIpO1xyXG4gICAgX21hcFNlc3Npb24uc2V0KF9zLnNpZCwgQ3JlYXRlU2Vzc2lvbkluZm8oX3MsIHVzZXIpKTtcclxuICAgIHJldHVybiBfcztcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXNzaW9uLW1hbmFnZXIuanMubWFwIiwiaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuLi8uLi9jb21tb24vbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFJlc3BvbmRDb2RlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9tZXNzYWdlXCI7XHJcbmZ1bmN0aW9uIFJlYnVpbGRDbGllbnQoY2FsbGJhY2spIHtcclxufVxyXG5mdW5jdGlvbiBfUnVuKGNQcm9jLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgTG9nZ2VyLkluZm8oYF9SdW4gcHJvY2VzcyBuYW1lOicke25hbWV9J2ApO1xyXG4gICAgbGV0IF9zdGRvdXRTdHIgPSAnJztcclxuICAgIGxldCBfc3RkZXJyU3RyID0gJyc7XHJcbiAgICBsZXQgX2Vycm9yID0gZmFsc2U7XHJcbiAgICBjUHJvYy5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIExvZ2dlci5JbmZvKGBjaGlsZCBzdGRvdXQ6JHtkYXRhfWApO1xyXG4gICAgICAgIF9zdGRvdXRTdHIgKz0gZGF0YTtcclxuICAgIH0pO1xyXG4gICAgY1Byb2Muc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcclxuICAgICAgICBfZXJyb3IgPSB0cnVlO1xyXG4gICAgICAgIF9zdGRlcnJTdHIgKz0gZGF0YTtcclxuICAgICAgICBMb2dnZXIuRXJyb3IoYGNoaWxkIHN0ZGVycjoke2RhdGF9YCk7XHJcbiAgICB9KTtcclxuICAgIGNQcm9jLm9uKCdleGl0JywgZnVuY3Rpb24gKGNvZGUsIHNpZ25hbCkge1xyXG4gICAgICAgIGlmIChfZXJyb3IpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIF9zdGRlcnJTdHIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sodHJ1ZSwgX3N0ZG91dFN0cik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIExvZ2dlci5JbmZvKGBjaGlsZCBwcm9jZXNzICcke25hbWV9JyBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX0gYW5kIHNpZ25hbCAke3NpZ25hbH1gKTtcclxuICAgIH0pO1xyXG4gICAgY1Byb2Mub24oJ2Nsb3NlJywgZnVuY3Rpb24gKGNvZGUsIHNpZ25hbCkge1xyXG4gICAgICAgIExvZ2dlci5JbmZvKGBjaGlsZCBwcm9jZXNzICcke25hbWV9JyBjbG9zZWQgd2l0aCBjb2RlICR7Y29kZX0gYW5kIHNpZ25hbCAke3NpZ25hbH1gKTtcclxuICAgIH0pO1xyXG4gICAgY1Byb2Mub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoY29kZSwgc2lnbmFsKSB7XHJcbiAgICAgICAgTG9nZ2VyLkluZm8oYGNoaWxkIHByb2Nlc3MgJyR7bmFtZX0nIGRpc2Nvbm5lY3Qgd2l0aCBjb2RlICR7Y29kZX0gYW5kIHNpZ25hbCAke3NpZ25hbH1gKTtcclxuICAgIH0pO1xyXG4gICAgY1Byb2Mub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAoY29kZSwgc2lnbmFsKSB7XHJcbiAgICAgICAgTG9nZ2VyLkluZm8oYGNoaWxkIHByb2Nlc3MgJyR7bmFtZX0nIG1lc3NhZ2Ugd2l0aCBjb2RlICR7Y29kZX0gYW5kIHNpZ25hbCAke3NpZ25hbH1gKTtcclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIF9SdW5TZXF1ZW5jZShhcnJQcm9jLCBjYWxsYmFjaykge1xyXG4gICAgaWYgKGFyclByb2MubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICBjYWxsYmFjayhSZXNwb25kQ29kZS5GQUlMLCBbXSwgJ2NvbW1hbmQgbGlzdCBlbXB0eS4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB4eHgoaW5kZXgpIHtcclxuICAgICAgICBpZiAoaW5kZXggPj0gYXJyUHJvYy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soUmVzcG9uZENvZGUuT0ssIF9vdXREYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBfdG1wID0gYXJyUHJvY1tpbmRleF07XHJcbiAgICAgICAgY29uc3QgX25hbWUgPSBfdG1wWzBdO1xyXG4gICAgICAgIGNvbnN0IF9wID0gc3Bhd24oX3RtcFsxXSwgX3RtcC5zbGljZSgyKSk7XHJcbiAgICAgICAgX1J1bihfcCwgX25hbWUsIChvaywgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBfb3V0RGF0YVtpbmRleF0gPSBkYXRhO1xyXG4gICAgICAgICAgICBpZiAob2spIHtcclxuICAgICAgICAgICAgICAgIHh4eCgrK2luZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKFJlc3BvbmRDb2RlLkZBSUwsIF9vdXREYXRhLCAnY29tbWFuZCBleGVjIGVycm9yLicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBfb3V0RGF0YSA9IFtdO1xyXG4gICAgeHh4KDApO1xyXG59XHJcbmZ1bmN0aW9uIEFyY2hpdmUoY2FsbGJhY2spIHtcclxuICAgIExvZ2dlci5JbmZvKCdBcmNoaXZlJyk7XHJcbiAgICBsZXQgX2NiO1xyXG4gICAgY29uc3QgX2RlYnVnT24gPSBmYWxzZTtcclxuICAgIGlmIChfZGVidWdPbikge1xyXG4gICAgICAgIF9jYiA9IChjb2RlLCBkYXRhLCBtc2cpID0+IHtcclxuICAgICAgICAgICAgTG9nZ2VyLkluZm8oYGNvZGU6JHtjb2RlfWApO1xyXG4gICAgICAgICAgICBMb2dnZXIuSW5mbygnZGF0YTonLCBkYXRhKTtcclxuICAgICAgICAgICAgTG9nZ2VyLkluZm8oYG1zZzoke21zZ31gKTtcclxuICAgICAgICAgICAgY2FsbGJhY2soY29kZSwgZGF0YSwgbXNnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgX2NiID0gY2FsbGJhY2s7XHJcbiAgICB9XHJcbiAgICBjb25zdCBfcmVwID0gXCJnaXRodWJcIjtcclxuICAgIGNvbnN0IF9icmFuY2ggPSBcIm1haW5cIjtcclxuICAgIF9SdW5TZXF1ZW5jZShbXHJcbiAgICAgICAgWydhZGQnLCAnZ2l0JywgJ2FkZCcsICctQSddLFxyXG4gICAgICAgIFsnY29tbWl0JywgJ2dpdCcsICdjb21taXQnLCAnLW0nLCBgYmFja3VwIGZyb20gd2ViIC0gJHtuZXcgRGF0ZSgpLnRvSlNPTigpfWBdLFxyXG4gICAgXSwgX2NiKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBBcmNoaXZlLFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGVsbC1jYWxsLmpzLm1hcCIsImltcG9ydCBMb2dnZXIgZnJvbSBcIi4uL2NvbW1vbi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgUmVzcG9uZENvZGUsIFJlcXVlc3RDb2RlIH0gZnJvbSBcIi4uL2NvbW1vbi9tZXNzYWdlXCI7XHJcbmltcG9ydCB7IEdldFNlc3Npb24sIEdldFZpc2l0b3JTZXNzaW9uIH0gZnJvbSBcIi4vc2Vzc2lvbi1tYW5hZ2VyXCI7XHJcbmltcG9ydCAqIGFzIFVzZXJNYW5hZ2VyIGZyb20gXCIuL3VzZXItbWFuYWdlclwiO1xyXG5pbXBvcnQgU2hlbGxDYWxsIGZyb20gXCIuL2NvcmUvc2hlbGwtY2FsbFwiO1xyXG5mdW5jdGlvbiBHZXRQYWdlTGlzdChyZXMsIHNlc3Npb24sIF8pIHtcclxuICAgIExvZ2dlci5EZWJ1ZygnR2V0UGFnZUxpc3QnLCBzZXNzaW9uLnNpZCk7XHJcbiAgICBzZXNzaW9uLnBpZCA9IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IF9oID0gc2Vzc2lvbi5HZXRIYW5kbGVPZlByb3BlcnR5KCk7XHJcbiAgICBsZXQgX2RhdGEgPSB7XHJcbiAgICAgICAgY29kZTogUmVzcG9uZENvZGUuT0ssXHJcbiAgICAgICAgZGF0YTogX2guR2V0UHJvcGVydGllcygpLFxyXG4gICAgfTtcclxuICAgIHJlcy5qc29uKF9kYXRhKTtcclxufVxyXG5mdW5jdGlvbiBBZGRQYWdlKHJlcywgc2Vzc2lvbiwgZGF0YSkge1xyXG4gICAgTG9nZ2VyLkRlYnVnKCdBZGRQYWdlJywgc2Vzc2lvbi5zaWQpO1xyXG4gICAgY29uc3QgX2ggPSBzZXNzaW9uLkdldEhhbmRsZU9mUHJvcGVydHkoKTtcclxuICAgIGNvbnN0IF9wcCA9IF9oLkNyZWF0ZVByb3BlcnR5KCk7XHJcbiAgICBpZiAoX3BwKSB7XHJcbiAgICAgICAgY29uc3QgX2RhdGEgPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IFJlc3BvbmRDb2RlLk9LLFxyXG4gICAgICAgICAgICBkYXRhOiBfcHAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXMuanNvbihfZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBMb2dnZXIuRXJyb3IoYHByb3BlcnR5IGNyZWF0ZSBmYWlsZWRgKTtcclxuICAgICAgICBjb25zdCBfZGF0YSA9IHtcclxuICAgICAgICAgICAgY29kZTogUmVzcG9uZENvZGUuRkFJTCxcclxuICAgICAgICAgICAgbXNnOiAncHJvcGVydHkgY3JlYXRlIGZhaWxlZC4nLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmVzLmpzb24oX2RhdGEpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIFVwZGF0ZVBhZ2UocmVzLCBzZXNzaW9uLCBkYXRhKSB7XHJcbiAgICBMb2dnZXIuRGVidWcoJ1VwZGF0ZVBhZ2UnLCBzZXNzaW9uLnNpZCk7XHJcbiAgICBkYXRhID0gZGF0YTtcclxuICAgIGNvbnN0IF9pbmZvQmFjayA9IHtcclxuICAgICAgICBjb2RlOiBSZXNwb25kQ29kZS5VTktOT1dOLFxyXG4gICAgICAgIGRhdGE6IHsgcGlkOiBkYXRhLmRhdGEucHAuaWQsIGluZGV4OiAtMSB9LFxyXG4gICAgfTtcclxuICAgIGNvbnN0IF9oID0gc2Vzc2lvbi5HZXRIYW5kbGVPZlByb3BlcnR5KCk7XHJcbiAgICBfaW5mb0JhY2suY29kZSA9IF9oLlVwZGF0ZVByb3BlcnR5KGRhdGEuZGF0YS5wcCk7XHJcbiAgICByZXMuanNvbihfaW5mb0JhY2spO1xyXG59XHJcbmZ1bmN0aW9uIEdldFBhZ2UocmVzLCBzZXNzaW9uLCBkYXRhKSB7XHJcbiAgICBMb2dnZXIuRGVidWcoJ0dldFBhZ2UnLCBzZXNzaW9uLnNpZCk7XHJcbiAgICBkYXRhID0gZGF0YTtcclxuICAgIHNlc3Npb24ucGlkID0gZGF0YS5kYXRhLmlkO1xyXG4gICAgY29uc3QgX2gyID0gc2Vzc2lvbi5HZXRIYW5kbGVPZlByb3BlcnR5KCk7XHJcbiAgICBjb25zdCBwcm9wZXJ0eSA9IF9oMi5HZXRQcm9wZXJ0eShkYXRhLmRhdGEuaWQpO1xyXG4gICAgaWYgKHByb3BlcnR5KSB7XHJcbiAgICAgICAgY29uc3QgX2ggPSBzZXNzaW9uLkdldEhhbmRsZU9mQ29udGVudChkYXRhLmRhdGEuaWQpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBfaC5HZXRQYWdlQ29udGVudCh0cnVlKTtcclxuICAgICAgICBsZXQgX2RhdGEgPSB7IGNvZGU6IFJlc3BvbmRDb2RlLk9LLCBkYXRhOiB7IGNvbnRlbnQsIHByb3BlcnR5IH0gfTtcclxuICAgICAgICByZXMuanNvbihfZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBsZXQgX2RhdGEgPSB7IGNvZGU6IFJlc3BvbmRDb2RlLkZBSUwsIG1zZzogJ2ZhaWxlZCcgfTtcclxuICAgICAgICByZXMuanNvbihfZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gTG9naW4ocmVzLCBzZXNzaW9uLCBkYXRhKSB7XHJcbiAgICBMb2dnZXIuRGVidWcoJ0xvZ2luLCBzaWQ6Jywgc2Vzc2lvbi5zaWQpO1xyXG4gICAgZGF0YSA9IGRhdGE7XHJcbiAgICBjb25zdCBfYWNjID0gZGF0YS5kYXRhLmFjY291bnQ7XHJcbiAgICBjb25zdCBfcHdkID0gZGF0YS5kYXRhLnB3ZDtcclxuICAgIGNvbnN0IF9yZXNDb2RlID0gVXNlck1hbmFnZXIuQ2hlY2tBY2NvdW50KF9hY2MsIF9wd2QpO1xyXG4gICAgaWYgKF9yZXNDb2RlID09PSBSZXNwb25kQ29kZS5PSykge1xyXG4gICAgICAgIGNvbnN0IF91c3IgPSBVc2VyTWFuYWdlci5HZXRVc2VyKF9hY2MpO1xyXG4gICAgICAgIGlmIChfdXNyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IF9leHAgPSAoZGF0YS5kYXRhLnJlbWViZXJNZSA/IDI0IDogMSkgKiA2MCAqIDYwICsgRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgcmVzLmNvb2tpZSgnc2lkJywgc2Vzc2lvbi5zaWQsIHsgc2lnbmVkOiB0cnVlLCBleHBpcmU6IF9leHAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IF9yZXNEYXRhID0ge1xyXG4gICAgICAgIGNvZGU6IF9yZXNDb2RlLFxyXG4gICAgfTtcclxuICAgIHJlcy5qc29uKF9yZXNEYXRhKTtcclxufVxyXG5mdW5jdGlvbiBEZWxldGVQYWdlKHJlcywgc2Vzc2lvbiwgZGF0YSkge1xyXG4gICAgTG9nZ2VyLkRlYnVnKCdVcGRhdGVQYWdlJywgc2Vzc2lvbi5zaWQpO1xyXG4gICAgZGF0YSA9IGRhdGE7XHJcbiAgICBjb25zdCBfaCA9IHNlc3Npb24uR2V0SGFuZGxlT2ZQcm9wZXJ0eSgpO1xyXG4gICAgX2guRGVsZXRlUHJvcGVydHkoZGF0YS5kYXRhLmlkKTtcclxuICAgIGxldCBfZGF0YSA9IHsgY29kZTogUmVzcG9uZENvZGUuT0sgfTtcclxuICAgIHJlcy5qc29uKF9kYXRhKTtcclxufVxyXG5mdW5jdGlvbiBBZGRXaWRnZXQocmVzLCBzZXNzaW9uLCBkYXRhKSB7XHJcbiAgICBMb2dnZXIuRGVidWcoJ0FkZFdpZGdldCcsIHNlc3Npb24uc2lkKTtcclxuICAgIGRhdGEgPSBkYXRhO1xyXG4gICAgY29uc3QgX2ggPSBzZXNzaW9uLkdldEhhbmRsZU9mQ29udGVudChkYXRhLmRhdGEucGlkKTtcclxuICAgIGxldCBfZGF0YSA9IHtcclxuICAgICAgICBjb2RlOiBSZXNwb25kQ29kZS5PSyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIHBpZDogZGF0YS5kYXRhLnBpZCxcclxuICAgICAgICAgICAgaW5kZXg6IGRhdGEuZGF0YS5pbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0Q29udGVudDogX2guQ3JlYXRlV2lkZ2V0Q29udGVudChkYXRhLmRhdGEuaW5kZXgpXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlmIChfZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgX2RhdGEuZGF0YS53aWRnZXRDb250ZW50LnR5cGUgPSBkYXRhLmRhdGEudHlwZTtcclxuICAgIH1cclxuICAgIHJlcy5qc29uKF9kYXRhKTtcclxufVxyXG5mdW5jdGlvbiBVcGRhdGVXaWRnZXQocmVzLCBzZXNzaW9uLCBkYXRhKSB7XHJcbiAgICBMb2dnZXIuRGVidWcoJ1VwZGF0ZVdpZGdldCcsIHNlc3Npb24uc2lkKTtcclxuICAgIGRhdGEgPSBkYXRhO1xyXG4gICAgY29uc3QgX2ggPSBzZXNzaW9uLkdldEhhbmRsZU9mQ29udGVudChkYXRhLmRhdGEucGlkKTtcclxuICAgIGxldCBfZGF0YSA9IHtcclxuICAgICAgICBjb2RlOiBSZXNwb25kQ29kZS5PSywgZGF0YTogeyB3YzogX2guVXBkYXRlV2lkZ2V0Q29udGVudChkYXRhLmRhdGEud2MpIH1cclxuICAgIH07XHJcbiAgICByZXMuanNvbihfZGF0YSk7XHJcbn1cclxuZnVuY3Rpb24gRGVsZXRlV2lkZ2V0KHJlcywgc2Vzc2lvbiwgZGF0YSkge1xyXG4gICAgTG9nZ2VyLkRlYnVnKCdEZWxldGVXaWRnZXQnLCBzZXNzaW9uLnNpZCk7XHJcbiAgICBkYXRhID0gZGF0YTtcclxuICAgIGNvbnN0IF9oID0gc2Vzc2lvbi5HZXRIYW5kbGVPZkNvbnRlbnQoZGF0YS5kYXRhLnBpZCk7XHJcbiAgICBfaC5EZWxldGVXaWRnZXRDb250ZW50KGRhdGEuZGF0YS53aWQpO1xyXG4gICAgbGV0IF9kYXRhID0geyBjb2RlOiBSZXNwb25kQ29kZS5PSywgZGF0YToge30gfTtcclxuICAgIHJlcy5qc29uKF9kYXRhKTtcclxufVxyXG5mdW5jdGlvbiBBcmNoaXZlKHJlcywgc2Vzc2lvbiwgZGF0YSkge1xyXG4gICAgTG9nZ2VyLkRlYnVnKCdBcmNoaXZlJywgc2Vzc2lvbi5zaWQpO1xyXG4gICAgbGV0IF9kYXRhID0geyBjb2RlOiBSZXNwb25kQ29kZS5TSEVMTF9DQUxMX0VSUk9SLCBkYXRhOiB7fSB9O1xyXG4gICAgU2hlbGxDYWxsLkFyY2hpdmUoKGNvZGUsIGRhdGEsIG1zZykgPT4ge1xyXG4gICAgICAgIF9kYXRhLmNvZGUgPSBjb2RlO1xyXG4gICAgICAgIGlmIChtc2cpXHJcbiAgICAgICAgICAgIF9kYXRhLm1zZyA9IG1zZztcclxuICAgICAgICByZXMuanNvbihfZGF0YSk7XHJcbiAgICB9KTtcclxufVxyXG5jb25zdCBfbWFwSGFuZGxlciA9IG5ldyBNYXAoKTtcclxuX21hcEhhbmRsZXIuc2V0KFJlcXVlc3RDb2RlLkxPR0lOLCBMb2dpbik7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5HRVRfUEFHRV9MSVNULCBHZXRQYWdlTGlzdCk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5HRVRfUEFHRSwgR2V0UGFnZSk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5BRERfUEFHRSwgQWRkUGFnZSk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5VUERBVEVfUEFHRSwgVXBkYXRlUGFnZSk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5ERUxFVEVfUEFHRSwgRGVsZXRlUGFnZSk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5BRERfV0lER0VULCBBZGRXaWRnZXQpO1xyXG5fbWFwSGFuZGxlci5zZXQoUmVxdWVzdENvZGUuVVBEQVRFX1dJREdFVCwgVXBkYXRlV2lkZ2V0KTtcclxuX21hcEhhbmRsZXIuc2V0KFJlcXVlc3RDb2RlLkRFTEVURV9XSURHRVQsIERlbGV0ZVdpZGdldCk7XHJcbl9tYXBIYW5kbGVyLnNldChSZXF1ZXN0Q29kZS5BUkNISVZFLCBBcmNoaXZlKTtcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2VydmUocmVxLCByZXMpIHtcclxuICAgIHZhciBfYTtcclxuICAgIGxldCBfcmVxRGF0YSA9IHJlcS5ib2R5O1xyXG4gICAgbGV0IF9mbiA9IF9tYXBIYW5kbGVyLmdldChfcmVxRGF0YS5jb2RlKTtcclxuICAgIGlmIChfZm4pIHtcclxuICAgICAgICBMb2dnZXIuRGVidWcoJ2Nvb2tpZXMgaXM6JywgcmVxLnNpZ25lZENvb2tpZXMpO1xyXG4gICAgICAgIGxldCBfcyA9IChfYSA9IEdldFNlc3Npb24ocmVxLnNpZ25lZENvb2tpZXNbJ3NpZCddKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogR2V0VmlzaXRvclNlc3Npb24oKTtcclxuICAgICAgICBfZm4ocmVzLCBfcywgX3JlcURhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgTG9nZ2VyLkVycm9yKGBpbnZhbGlkIHJlcXVlc3RpbmcgY29kZTogJHtfcmVxRGF0YS5jb2RlfSBgKTtcclxuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgY29kZTogUmVzcG9uZENvZGUuUVVFU1RfQ09ERV9JTlZBTElEIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXJ2aWNlLmpzLm1hcCIsImltcG9ydCBMb2dnZXIgZnJvbSBcIi4uL2NvbW1vbi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgUmVzcG9uZENvZGUgfSBmcm9tIFwiLi4vY29tbW9uL21lc3NhZ2VcIjtcclxuaW1wb3J0IHsgR2V0U2Vzc2lvbiwgR2V0VmlzaXRvclNlc3Npb24gfSBmcm9tIFwiLi9zZXNzaW9uLW1hbmFnZXJcIjtcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2VydmUocmVxLCByZXMpIHtcclxuICAgIHZhciBfYTtcclxuICAgIGxldCBfcyA9IChfYSA9IEdldFNlc3Npb24ocmVxLnNpZ25lZENvb2tpZXNbJ3NpZCddKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogR2V0VmlzaXRvclNlc3Npb24oKTtcclxuICAgIExvZ2dlci5EZWJ1ZygndXBsb2FkJywgX3Muc2lkKTtcclxuICAgIGNvbnN0IF9oID0gX3MuR2V0SGFuZGxlT2ZVcGxvYWQoKTtcclxuICAgIF9oLlVwbG9hZChyZXEsIChlcnIsIGZpZWxkcywgZmlsZXMpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5FcnJvcignZXJyb3InKTtcclxuICAgICAgICAgICAgbGV0IF9kYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogUmVzcG9uZENvZGUuVVBMT0FEX0ZBSUxFRCxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGVycixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVzLmpzb24oX2RhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IF9kYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogUmVzcG9uZENvZGUuT0ssXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGZpZWxkcywgZmlsZXMgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVwbG9hZC5qcy5tYXAiLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcclxuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XHJcbmltcG9ydCBjb29raWVQYXJzZXIgZnJvbSAnY29va2llLXBhcnNlcic7XHJcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4uL2NvbW1vbi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgR2xvYmFsUGF0aHMgfSBmcm9tIFwiLi9jb3JlL2Jhc2ljXCI7XHJcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCIuL3NlcnZpY2VcIjtcclxuaW1wb3J0IFVwbG9hZCBmcm9tIFwiLi91cGxvYWRcIjtcclxuTG9nZ2VyLkluZm8oXCJzZXJ2ZXIgZ29pbmcgdG8gc3RhcnQuXCIpO1xyXG5jb25zdCBtYWluQXBwID0gZXhwcmVzcygpO1xyXG5tYWluQXBwLnVzZShjb21wcmVzc2lvbigpKTtcclxubWFpbkFwcC51c2UoJy8nLCBleHByZXNzLnN0YXRpYyhHbG9iYWxQYXRocy5ST09UX0NMSUVOVCkpO1xyXG5tYWluQXBwLnVzZSgnL2Fzc2V0cycsIGV4cHJlc3Muc3RhdGljKGAke0dsb2JhbFBhdGhzLlJPT1RfQ09OVEVOVH1hc3NldHMvYCkpO1xyXG5tYWluQXBwLnVzZShjb29raWVQYXJzZXIoJ3NpbmdlZE15Q29va2llJykpO1xyXG5tYWluQXBwLnBvc3QoXCIvc2VydmljZVwiLCBib2R5UGFyc2VyLmpzb24oeyBsaW1pdDogXCIxbWJcIiB9KSwgU2VydmljZSk7XHJcbm1haW5BcHAucG9zdCgnL3VwbG9hZCcsIFVwbG9hZCk7XHJcbmNvbnN0IF9QT1JUID0gODE4MTtcclxubWFpbkFwcC5saXN0ZW4oX1BPUlQsICgpID0+IExvZ2dlci5JbmZvKGBTTE9HIEhUVFAgc2VydmVyIGlzIG5vdyBsaXN0ZW5pbmcgcG9ydDogJHtfUE9SVH1gKSk7XHJcbkxvZ2dlci5JbmZvKFwic2VydmVyIGlzIHdvcmtpbmcgLi4uXCIpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXJ2ZXIuanMubWFwIl0sIm5hbWVzIjpbIkZTIiwiX25ld2VzdFZlcnNpb24iLCJfbmV3ZXN0VmVyc2lvblN0cmluZyIsIlVwZGF0ZSIsIl9QYXJzZXJzIiwiUGFyc2UiLCJGaWxlSU8uUmVhZEZpbGVVVEY4IiwiRmlsZUlPLldyaXRlRmlsZVVURjgiLCJDcmVhdGVSZWFkV29ya2VyIiwiQ3JlYXRlUmVhZFdyaXRlV29ya2VyIiwiRmlsZUlPLkRlbGV0ZUZpbGUiLCJGaWxlSU8uQ3JlYXRlRm9sZGVySWZOb3RFeGlzdCIsIlVwbG9hZFdvcmtlci5HZXRVcGxvYWRXb3JrZXIiLCJDb250ZW50V29ya2VyLkdldFBhZ2VDb250ZW50V29ya2VyIiwiUHJvcGVydHlXb3JrZXIuR2V0UGFnZVByb3BlcnR5V29ya2VyIiwic3Bhd24iLCJBcmNoaXZlIiwiVXNlck1hbmFnZXIuQ2hlY2tBY2NvdW50IiwiVXNlck1hbmFnZXIuR2V0VXNlciIsIlNlcnZlIiwiYm9keVBhcnNlciIsIlNlcnZpY2UiLCJVcGxvYWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWNBLGFBQWU7QUFDZixJQUFJLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO0FBQ3hELElBQUksSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUM7QUFDdEQsSUFBSSxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FB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bUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0MsSUFBSSxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBSSxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBSSxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEtBQUs7QUFDdEMsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFRLFVBQVUsSUFBSSxJQUFJLENBQUM7QUFDM0IsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksS0FBSztBQUN0QyxRQUFRLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBUSxVQUFVLElBQUksSUFBSSxDQUFDO0FBQzNCLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM3QyxRQUFRLElBQUksTUFBTSxFQUFFO0FBQ3BCLFlBQVksUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN4QyxTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2QyxTQUFTO0FBQ1QsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RixLQUFLLENBQUMs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
