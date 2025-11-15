import { exec, spawn } from 'node:child_process';
import Logger from "../../common/logger";
import { RespondCode, RequestCode } from "../../common/message"

export type callback_func_t = (ok: boolean, stdout: string) => void;
export type callback_func2_t = (code: RespondCode, data: Array<string>, msg?: string) => void;

function RebuildClient(callback: callback_func_t) {
    //const _cmd = `cd client && node build.js && cd ..`;
}

function _Run(cProc: any, name: string, callback: callback_func_t): void {
    Logger.Info(`_Run process name:'${name}'`);
    let _stdoutStr: string = '';
    let _stderrStr: string = '';
    let _error: boolean = false;
    cProc.stdout.on('data', (data: any) => {
        Logger.Info(`child stdout:${data}`);
        _stdoutStr += data;
    });
    cProc.stderr.on('data', (data: any) => {
        _error = true;
        _stderrStr += data;
        Logger.Error(`child stderr:${data}`);
    });
    cProc.on('exit', function(code: number, signal: any) {
        if (_error) {
            callback(false, _stderrStr);
        } else {
            callback(true, _stdoutStr);
        }
        Logger.Info(`child process '${name}' exited with code ${code} and signal ${signal}`);
    });
    cProc.on('close', function(code: number, signal: any) {
        Logger.Info(`child process '${name}' closed with code ${code} and signal ${signal}`);
    });
    cProc.on('disconnect', function(code: number, signal: any) {
        Logger.Info(`child process '${name}' disconnect with code ${code} and signal ${signal}`);
    });
    cProc.on('message', function(code: number, signal: any) {
        Logger.Info(`child process '${name}' message with code ${code} and signal ${signal}`);
    });
}

function _RunSequence(arrProc: Array<Array<string>>, callback: callback_func2_t): void {
    if (arrProc.length <= 0) {
        callback(RespondCode.FAIL, [], 'command list empty.');
        return;
    }
    function xxx(index: number): void {
        //Logger.Debug(`index:${index}, length:${arrProc.length}`);
        if (index >= arrProc.length) {
            callback(RespondCode.OK, _outData);
            return;
        }
        const _tmp = arrProc[index];
        const _name = _tmp[0];/// name, cmd, args;
        const _p = spawn(_tmp[1], _tmp.slice(2));
        _Run(_p, _name, (ok, data) => {
            _outData[index] = data;
            if (ok) {
                xxx(++index);
            } else {
                callback(RespondCode.FAIL, _outData, 'command exec error.');
                return;
            }
        });
    }

    const _outData: Array<string> = [];
    xxx(0);
}


function Archive(callback: callback_func2_t): void {
    Logger.Info('Archive');

    let _cb: callback_func2_t;
    const _debugOn: boolean = false;
    if (_debugOn) {
        _cb = (code: RespondCode, data: Array<string>, msg?: string) => {
            Logger.Info(`code:${code}`);
            Logger.Info('data:', data);
            Logger.Info(`msg:${msg}`);
            callback(code, data, msg);
        }
    } else {
        _cb = callback;
    }

    const _rep: string = "github";
    const _branch: string = "main";
    _RunSequence([
        //{ p: spawn('git', ['pull', _rep, _branch]), name: 'pull' },
        ['add', 'git', 'add', '-A'],
        ['commit', 'git', 'commit', '-m', `backup from web - ${new Date().toJSON()}`],
        //{ p: spawn('git', ['push', _rep, _branch]), name: 'push' },
    ], _cb);
}

/// https://github.com/kpdecker/jsdiff
export default {
    Archive,
    //RebuildClient,
    //GitLog
}
