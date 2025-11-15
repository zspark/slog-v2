import DynamicImport from "../common/dynamic-import"

export type finishCallback = () => void;
export type updateCallback = (t: number) => void;
export type tweenOptions = {
    updateFn: updateCallback;
    duration?: number; // ms
    data?: any;
    finishedFn?: finishCallback;
};
export type forwardFunction = (f: number, t: number, d: number) => void;
export type releaseFunction = () => void;
export type tweenHandler = {
    Release: releaseFunction;
    Forward: forwardFunction;
};
type tweenFunction = (input: tweenOptions, out: tweenHandler) => void;
const _defaultForwardFunction: forwardFunction = (f: number, t: number, d: number) => void {};
const _defaultReleaseFunction: releaseFunction = () => void {};

const _mapAA = new Map<tweenOptions, tweenHandler>();
function _NoTweenFn(options: tweenOptions, out: tweenHandler): void {
    out.Forward = function(from, to, duration) {
        options.updateFn(to);
        options.finishedFn && options.finishedFn();
    };
    out.Release = function() {
        _mapAA.delete(options);
    };
    _mapAA.set(options, out);
}
let _TweenFn: tweenFunction = _NoTweenFn;

let TWEENJS: any;

function _StartTween() {
    if (TWEENJS.update()) {
        requestAnimationFrame(_StartTween);
    }
}

function _Tween(options: tweenOptions, out: tweenHandler): void {
    const tween = new TWEENJS.Tween(options.data).easing(TWEENJS.Easing.Quadratic.Out).onUpdate(options.updateFn);
    if (options.finishedFn) tween.onComplete(options.finishedFn);

    //tween.repeat(10) // repeats 10 times after the first tween and stops
    //tween.repeat(Infinity) // repeats forever
    //tween.delay(1000)
    //tween.repeatDelay(500)

    out.Forward = function(from, to, duration) {
        if (!tween.isPlaying()) {
            tween
                .from(from)
                .to(to, duration ?? options.duration)
                .start();
            _StartTween();
        }
    };
    out.Release = function() {
        tween.stop();
        tween.onUpdate(null);
        tween.onComplete(null);
    };
}

function _Init(url: string): void {
    DynamicImport(url).then(
        (m) => {
            if (m) {
                TWEENJS = m;
                _mapAA.forEach((out, options) => {
                    _Tween(options, out);
                });
                _TweenFn = _Tween;
                _mapAA.clear();
                _api.Init = () => { };
                console.info(`[SLOG] Module file(${url}) dynamically loaded.`);
            }
        },
        (err) => {
            console.error(`[SLOG] Can NOT load file(${url}) dynamically.Because:
${err}`);
        }
    );
}

const _api = {
    Tween: function Tween(options: tweenOptions): tweenHandler {
        options.duration = options.duration ?? 300;
        const _out: tweenHandler = {
            Release: _defaultReleaseFunction,
            Forward: _defaultForwardFunction,
        };
        _TweenFn(options, _out);
        return _out;
    },
    Init: _Init,
};

export default _api;
