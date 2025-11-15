import formidable from 'formidable';
//import Jimp from "jimp";
import { url_t, path_t, pid_t, wid_t, page_property_t } from "../common/types"
import { RespondCode } from "../common/message"
import Logger from "../common/logger"
import { USER_TYPE } from "./core/privilege"

type cb_func_t = (err: any, fields: any, files: any) => void;
export interface IResourceUploadWorker {
    Upload(req: any, cbFunc: cb_func_t): void;
}

function CreateReadWorker(): IResourceUploadWorker {
    return {
        Upload(_: any, cbFunc: cb_func_t): void {
            cbFunc('no rights to upload files.', undefined, undefined);
        }
    };
}

function CreateReadWriteWorker(pid: pid_t): IResourceUploadWorker {
    return {
        Upload(req: any, cbFunc: cb_func_t): void {
            const form = formidable({
                multiples: true,
                allowEmptyFiles: false,
                uploadDir: `./content/pages/${pid}`,
                keepExtensions: true,
                filename: (name, ext, a, b,) => {
                    return `${name}${ext}`;/// name or ext includes '.'
                }
            });

            form.once('end', () => {
                Logger.Info('Done!');
            });

            form.on('file', (formname, file) => {
                Logger.Info('formname:', formname);
                //Logger.Info('file:', file);

                /*
                Jimp.read(file.filepath, (err, lenna) => {
                    if (err) throw err;
                    lenna
                        .resize(64, 64) // resize
                        .quality(60) // set JPEG quality
                        .greyscale() // set greyscale
                        .write(`../upload/${file.newFilename}`); // save
                });
                */
            });
            form.parse(req, cbFunc);
        }
    };
}

export function GetUploadWorker(userType: USER_TYPE, pid: pid_t | undefined): IResourceUploadWorker {
    Logger.Debug('GetUploadWorker', userType);
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
            return pid ? CreateReadWriteWorker(pid) : CreateReadWorker();
    }
}
