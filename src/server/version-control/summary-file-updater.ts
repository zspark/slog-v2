import { page_property_t, pid_t, page_resource_t } from "../../common/types"
import Logger from "../../common/logger"
import { version_t, GetVersionString, MakeVersion } from "./version"

type summary_file_base_format_t = {
    version: version_t,
    pages: Array<any>,
}

type summary_file_v0_5_t = {
    version: version_t,
    pages: Array<{
        id: pid_t,
        title: string,
        createTime: string,
        modifyTime: string,
        description: string,
        tags: string,
        resources: Array<{ name: string, dim: Array<number>, sizeInBytes: number }>,
    }>
}

const _newestVersion = MakeVersion(0, 5, 0, 0);
const _newestVersionString = GetVersionString(_newestVersion, 2);
type _newestFileVersion = summary_file_v0_5_t;

type parser_func_t = (a: summary_file_base_format_t, out: Array<page_property_t>) => void;
const _Parsers: Record<string, parser_func_t> = {};
_Parsers[GetVersionString(MakeVersion(0, 5, 0, 0), 2)] = (input: summary_file_v0_5_t, out: Array<page_property_t>): void => {
    for (let i = 0, N = input.pages.length; i < N; ++i) {
        const _tmp = input.pages[i];
        let _u: page_property_t = {
            id: _tmp.id,
            createTime: _tmp.createTime,
            modifyTime: _tmp.modifyTime,
            title: _tmp.title,
            author: '',
            description: _tmp.description,
            tags: _tmp.tags,
            resources: [],
        };
        const _N = _tmp.resources?.length ?? 0;
        for (let i = 0; i < _N; ++i) {
            const _r: page_resource_t = {
                name: _tmp.resources[i].name,
                dim: [..._tmp.resources[i].dim],
                sizeInBytes: _tmp.resources[i].sizeInBytes,
            };
            _u.resources.push(_r);
        }
        out.push(_u);
    }
}

export function Parse(input: string, out: Array<page_property_t>): boolean {
    try {
        const _tmp = JSON.parse(input) as summary_file_base_format_t;
        const _V = GetVersionString(_tmp.version, 2);
        const _parser = _Parsers[_V];
        if (_parser) {
            _parser(_tmp, out);
            return _V !== _newestVersionString;
        } else {
            Logger.Error('there is No such parser for summary file of version:', _V);
            return false;
        }
    } catch (e: any) {
        Logger.Error('summary file parse error!\n', e);
        return false;
    }
}

export function Update(input: Array<page_property_t>): string {
    const _tmp: _newestFileVersion = {
        version: _newestVersion,
        pages: [],
    }
    for (let i = 0, N = input.length; i < N; ++i) {
        const _r: page_property_t = input[i];
        const _p: any = {
            id: _r.id,
            title: _r.title,
            createTime: _r.createTime,
            modifyTime: _r.modifyTime,
            description: _r.description,
            tags: _r.tags,
            resources: [],
        };
        for (let j = 0, N = _r.resources.length; j < N; ++j) {
            const _tmp: any = {
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

export default { Update, Parse };
