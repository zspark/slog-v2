require('dotenv').config()
///console.log(process.env) // remove this after you've confirmed it is working
const { BUILD, MINIFY } = process.env;

const Path = require('path')
const FS = require('fs');
//const CleanCSS = require("clean-css");
const JSDOM = require('jsdom');

const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const cleanup = require('rollup-plugin-cleanup');
const Rollup = require('rollup');


function _Rename(path, oldName, newName) {
    FS.rename(Path.resolve(path, oldName), Path.resolve(path, newName), function(err) {
        if (err) throw err;
        console.log('File Renamed!');
    });
}

function GenerateUI() {
    const _arrFiles = ['login.html', 'main.html'];
    const _arrOutputFiles = ['login.ui.js', 'main.ui.js'];

    for (let i = 0; i < _arrFiles.length; i++) {
        let _fileContent = FS.readFileSync(Path.resolve('ui', _arrFiles[i]), 'utf8');
        const dom = new JSDOM.JSDOM(_fileContent);
        const _body = dom.window.document.querySelector('body');
        if (!_body) {
            console.error(`GenerateMainUI error. file name:${_arrFiles[i]}`);
            return false;
        }
        const _outContent = `const ui =\`<html>${_body.outerHTML}</html>\`;export default ui;`;
        FS.writeFileSync(Path.resolve('deployment/www/lib/slog/ui', _arrOutputFiles[i]), _outContent);
    };
    return true;
}

function CopyFiles() {
    FS.cp(Path.resolve('ui', 'index.html'), Path.resolve('deployment/www', 'index.html'), { force: true }, () => { console.log('index.html file copied'); });
    FS.cp(Path.resolve('ui', 'ui.js'), Path.resolve('deployment/www/lib/slog/js', 'ui.js'), { force: true }, () => { console.log('ui.js file copied'); });
    FS.cp(Path.resolve('ui/lib/slog/css', 'style.css'), Path.resolve('deployment/www/lib/slog/css', 'style.css'), { force: true }, () => { console.log('css file copied'); });
}

async function RollupBundleServer() {
    console.info(new Date().toString(), 'Bundling...');

    // create a bundle
    const bundle = await Rollup.rollup({
        input: [`.build/server/server.js`],
        //plugins: [cleanup()],
    });
    //console.log("server depends on :\n", bundle.watchFiles); // an array of file names this bundle depends on

    // generate output specific code in-memory
    // you can call this function multiple times on the same bundle object
    const _outOption = {
        file: `./deployment/server.bundle.cjs`,
        format: 'cjs',
        name: 'server',
        sourcemap: 'inline',
    }
    await bundle.write(_outOption);

    // closes the bundle
    await bundle.close();
}

async function RollupBundleClient() {
    let plugs = [nodeResolve(), commonjs()];
    if (BUILD === 'product') {
    }
    if (MINIFY === 'yes') {
        plugs.push(cleanup());
        plugs.push(terser({ maxWorkers: 4 }));
    }
    //console.info(new Date().toString(), 'Bundling...');

    // create a bundle
    const bundle = await Rollup.rollup({
        input: [`.build/client/main.js`, `.build/client/init.js`],
        treeshake: true,
        plugins: plugs,
        ///external: ['katex'],
    });
    //console.log("client depends on :\n", bundle.watchFiles); // an array of file names this bundle depends on

    // generate output specific code in-memory
    // you can call this function multiple times on the same bundle object
    const _outOption = {
        dir: `./deployment/www/lib/slog/js`,
        format: 'esm',
        sourcemap: 'inline',
        chunkFileNames: 'shared.bundle.js',
        //chunkFileNames: (chunkInfo) => { return `${chunkInfo.name}.bundle.js`; },
        indent: false,
    }
    const { output } = await bundle.generate(_outOption);
    for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
        } else {
            /*
            console.log(
                'type:', chunkOrAsset.type,
                '\nname:', chunkOrAsset.name,
                '\nfileName:', chunkOrAsset.fileName,
                '\nreffiles:', chunkOrAsset.referencedFiles,
                //'\nmodules', chunkOrAsset.modules,
                //'\ncode:', chunkOrAsset.code,
                '\n'
            );
            */
        }
    }
    await bundle.write(_outOption);

    // closes the bundle
    await bundle.close();

    /// rename;
    _Rename("./deployment/www/lib/slog/js/", "main.js", "main.bundle.js");
    _Rename("./deployment/www/lib/slog/js/", "init.js", "init.bundle.js");
}

RollupBundleServer();
RollupBundleClient();
GenerateUI();
CopyFiles();






