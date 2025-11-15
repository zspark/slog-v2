import { url_t, page_property_t, pid_t } from "../common/types"
import { RespondCode } from "../common/message"
import Logger from "../common/logger"
import { GenID } from "../common/id-generator"
import { GlobalPaths } from "./core/basic"
import * as FileIO from "./core/file-io"
import SummaryFileUpdater from "./version-control/summary-file-updater"
import { Collection } from "./core/collection"
//import DataState from "./data-state"

const _summaryFileURL: url_t = `${GlobalPaths.ROOT_CONTENT}pages/summary.json`;
const _pageCollection = new Collection<pid_t, page_property_t>();
(function() {
    const _tmp: string | undefined = FileIO.ReadFileUTF8(_summaryFileURL);
    if (_tmp) {
        const _output: Array<page_property_t> = [];
        if (SummaryFileUpdater.Parse(_tmp, _output)) {
            SaveToDisk(_output);
        }

        for (let i = 0, N = _output.length; i < N; ++i) {
            //Logger.Info(_output[i].id, _output[i]);
            _pageCollection.Insert(_output[i]);
        }
    }
})()

function SaveToDisk(input?: Array<page_property_t>): void {
    FileIO.WriteFileUTF8(_summaryFileURL, SummaryFileUpdater.Update(input ?? GetProperties()));
}

function GetProperty(id: pid_t): page_property_t | undefined {
    const _pp = _pageCollection.GetByKey(id);
    if (_pp) {
        return JSON.parse(JSON.stringify(_pp));
    }
    return undefined;
}
function GetProperties(): Array<page_property_t> {
    const _out: Array<page_property_t> = [];
    _pageCollection.ForEach((v: page_property_t, _: number): boolean => {
        _out.push(JSON.parse(JSON.stringify(v)) as page_property_t);
        return false;
    }, undefined);
    return _out;
}
function ModifyProperty(pp: page_property_t): RespondCode {
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
function DeleteProperty(id: pid_t): boolean {
    return _pageCollection.RemoveByKey(id);
}
function CreateProperty(): page_property_t | undefined {
    const _pp: page_property_t = {
        id: GenID(),
        description: '',
        createTime: new Date().toISOString(),
        modifyTime: new Date().toISOString(),
        title: new Date().toString(),
        author: '',
        tags: '',
        resources: [],
    }
    _pageCollection.Insert(_pp, -1);
    return _pp;
}

export default { GetProperty, GetProperties, ModifyProperty, DeleteProperty, CreateProperty, SaveToDisk };

