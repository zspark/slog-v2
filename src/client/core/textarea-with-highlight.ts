//import { minimalSetup } from "codemirror"
//import { vim } from "@replit/codemirror-vim"
import { EditorView, /*lineNumbers,*/ highlightActiveLine, keymap } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { autocompletion, completionKeymap } from "@codemirror/autocomplete"
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { history, defaultKeymap, historyKeymap, /*indentWithTab,*/ insertTab, indentLess } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { markdown as lang_markdown } from "@codemirror/lang-markdown"
import { javascript as lang_javascript } from "@codemirror/lang-javascript"
import { json as lang_json } from "@codemirror/lang-json"
import { html as lang_html } from "@codemirror/lang-html"

const _langMap: Record<string, Function> = {
    'markdown': lang_markdown,
    'javascript': lang_javascript,
    'json': lang_json,
    'html': lang_html,
}

const myTheme = EditorView.theme({
    "&": {
        width: "100%",
        //fontSize: "smaller",
        //font: "'JetBrains Mono', monospace",
        //fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
        //fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    "&.cm-focused": {
        outline: "2px solid transparent",
        outlineOffset: "2px"
    },
    "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "rgb(226 232 240)"
    },
    ".cm-gutters": {
        backgroundColor: "rgb(241 245 249)",
        color: "#ddd",
        //border: "none"
    },
    ".cm-line": {
        lineHeight: '1.5rem'/* 20px */,
    },

}, { dark: false })

/**
 * <h1>doc to test </h1>
 */
export default class TextareaWithHighlight {
    #_text: string = '';
    #_lang: string = 'markdown';
    #_editor: EditorView | undefined;
    #_state: EditorState | undefined;
    #_language: Compartment;

    constructor(highlightLang: string = 'markdown') {
        this.#_lang = highlightLang;
        this.#_language = new Compartment();
    }

    Init(editableElement: HTMLElement) {
        if (this.#_editor) return;

        const _langFunc: Function = (this.#_lang ? _langMap[this.#_lang] : lang_markdown) ?? lang_markdown;
        this.#_state = EditorState.create({
            extensions: [
                EditorView.lineWrapping,
                //lineNumbers(),
                autocompletion(),
                bracketMatching(),
                highlightActiveLine(),
                highlightSelectionMatches(),
                history(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                //codeFolding(),
                //vim(),
                //basicSetup,
                //minimalSetup,
                keymap.of([
                    ...defaultKeymap,
                    ...searchKeymap,
                    ...historyKeymap,
                    ...lintKeymap,
                    ...completionKeymap,
                    {
                        key: 'Tab',
                        preventDefault: true,
                        run: insertTab,
                    },
                    /*
                        *J: would NOT work for me.
                    {
                        key: 'Shift-Tab',
                        preventDefault: true,
                        run: indentLess,
                    },
                    */
                ]),
                myTheme,
                EditorState.tabSize.of(2),
                this.#_language.of(_langFunc()),
            ],
            doc: this.#_text,
        })

        this.#_editor = new EditorView({
            state: this.#_state,
            parent: editableElement,
        })

        this.#_text = '';
        this.#_lang = '';
    }

    get text(): string {
        const currentValue = this.#_editor?.state.doc.toString();
        return currentValue ?? this.#_text;
    }

    set text(s: string) {
        if (this.#_editor) {
            const _len: number = this.#_editor.state.doc.toString().length;
            this.#_editor.dispatch({
                changes: { from: 0, to: _len, insert: s },
            });
        } else {
            this.#_text = s;
        }
    }

    set highlightLang(lang: string) {
        if (this.#_editor) {
            const _langFunc: Function = (lang ? _langMap[lang] : lang_markdown) ?? lang_markdown;
            this.#_editor.dispatch({
                effects: this.#_language.reconfigure(_langFunc())
            })
        } else {
            this.#_lang = lang;
        }
    }

    Destroy() {
        this.#_editor?.destroy();
        this.#_editor = undefined;
        this.#_text = '';
    }
}

