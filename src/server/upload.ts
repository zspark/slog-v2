import Logger from "../common/logger"
import {
    RespondCode, RequestCode, request_t,
    Messages
} from "../common/message"
import { Session, GetSession, GetVisitorSession } from "./session-manager"

export default function Serve(req: any, res: any): void {
    let _s: Session = GetSession(req.signedCookies['sid'] as string) ?? GetVisitorSession();
    Logger.Debug('upload', _s.sid);

    const _h = _s.GetHandleOfUpload();
    _h.Upload(req, (err, fields, files) => {
        if (err) {
            Logger.Error('error');
            let _data: Messages['upload']['respond_t'] = {
                code: RespondCode.UPLOAD_FAILED,
                data: err,
            };
            res.json(_data);
        } else {
            let _data: Messages['upload']['respond_t'] = {
                code: RespondCode.OK,
                data: { fields, files }
            };
            //const _h2 = _s.GetHandleOfProperty();
            //_h2.GetProperty(_s.pid);
            //res.json(_data);
        }
    });

}

