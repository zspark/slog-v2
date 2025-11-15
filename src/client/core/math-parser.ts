import Katex from 'katex';

function MathStringIntoHTML(content: string, parentElem: HTMLElement): void {
    Katex.render(content, parentElem, {
        throwOnError: false
    });
}
function MathStringToHTML(content: string): string {
    const _html = Katex.renderToString(content, {
        throwOnError: false
    });
    return _html;
    /*
    return new Promise((resovle, reject) => {
        const _html = Katex.renderToString(content, {
            throwOnError: false
        });
        resovle(_html);
    });
    */
}

export default { MathStringToHTML, MathStringIntoHTML }

