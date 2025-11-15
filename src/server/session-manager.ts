import { pid_t } from "../common/types"
import Logger from "../common/logger"
import { GenID } from "../common/id-generator"
import { User, GetVisitor } from "./user-manager"
import * as PropertyWorker from "./page-property-worker"
import * as ContentWorker from "./page-content-worker"
import * as UploadWorker from "./resource-upload-worker"

export type sid_t = string;

export class Session {
    readonly sid: sid_t;
    private _user: User;
    private _pid: pid_t | undefined;

    constructor(id: sid_t, user: User) {
        this.sid = id;
        this._user = user;
    }

    GetHandleOfUpload(): UploadWorker.IResourceUploadWorker {
        return UploadWorker.GetUploadWorker(this._user.type, this._pid);
    }

    GetHandleOfContent(pid: pid_t): ContentWorker.IContentWorker {
        return ContentWorker.GetPageContentWorker(this._user.type, pid);
    }

    GetHandleOfProperty(): PropertyWorker.IPropertyWorker {
        //Logger.Debug(`pid:`, pid, " ", this._propertyManipulator);
        return PropertyWorker.GetPagePropertyWorker(this._user.type);
    }

    set pid(value: pid_t | undefined) {
        this._pid = value;
    }
    get pid(): pid_t | undefined {
        return this._pid;
    }
}

type SessionInfo = {
    createTime: string,
    lastSyncTime: string,
    session: Session,
    readonly user: User,
}
function CreateSessionInfo(s: Session, user: User): SessionInfo {
    return {
        createTime: new Date().toISOString(),
        lastSyncTime: new Date().toISOString(),
        session: s,
        user,
    }
}


const _mapSession = new Map<sid_t, SessionInfo>();
const _visitorSession = new Session('visitor-session-id', GetVisitor());

setInterval(_ => {
    _mapSession.forEach(sInfo => { });
    _mapSession.clear();
}, 24 * 60 * 60 * 1000);

export function GetSession(sid: sid_t | undefined): Session | undefined {
    if (sid) {
        return _mapSession.get(sid)?.session;
    }
}

export function GetVisitorSession(): Session { return _visitorSession; }

export function DeleteSession(sid: sid_t): void {
    const _sInfo: SessionInfo | undefined = _mapSession.get(sid);
    if (_sInfo) {
        _mapSession.delete(sid);
    }
}

export function CreateSession(user: User): Session {
    const _s: Session = new Session(GenID(), user);
    _mapSession.set(_s.sid, CreateSessionInfo(_s, user));
    return _s;
}

