import { marked } from 'marked';
import markedKatex from "marked-katex-extension-ts";

/*
import { Parser } from "../../3rd/marked/Parser.js";
import { Renderer } from "../../3rd/marked/Renderer.js";
import { Tokenizer } from "../../3rd/marked/Tokenizer.js";
import { Lexer } from "../../3rd/marked/Lexer.js";
*/
//import Highlighter from './highlighter.js'


const options = {
    throwOnError: false
};
marked.use(markedKatex(options));

const _r = new marked.Renderer();
const _t = new marked.Tokenizer();
const _options: marked.MarkedOptions = {
    tokenizer: _t,
    renderer: _r,
    gfm: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    headerIds: true,
    headerPrefix: "",

};
//const _parser = new marked.Parser(_options);



/*
async function MarkdownStringToHTML2(content) {
    let _arrToken, _arrPromise;
    const _tokens = Lexer.lex(content);
    for (let i = 0, N = _tokens.length; i < N; ++i) {
        let _t = _tokens[i];
        if (_t.type === 'code') {
            _arrToken = _arrToken ?? [];
            _arrPromise = _arrPromise ?? [];
            _arrToken.push(_t);
            _arrPromise.push(Highlighter.LoadLanguage(_t.lang));
        }
    }

    if (_arrPromise) {
        await Promise.allSettled(_arrPromise).then(() => {
            _arrToken.forEach((_t) => {
                _t.text = Highlighter.Highlight(_t.text, _t.lang);
                _t.escaped = true;
            });
        });
    }
    return _parser.parse(_tokens);
}
*/

function MarkdownStringToHTML(content: string): string {
    return marked.parse(content, _options);
    //const _tokens = marked.Lexer.lex(content);
    //return `<div>${_parser.parse(_tokens)}</div>`;
}

export default { MarkdownStringToHTML }

