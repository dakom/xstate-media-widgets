import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {KeyBuffer, KeyEvent} from "../types/Keylog-Types";

export type RecorderMeta = KeyBuffer;

export const createRecorder = ():Recorder<KeyBuffer, RecorderMeta> => {
    let _resolve:Option<Thunk> = none;
    let _recordStartTime:number;
    let _buffer:KeyBuffer;
    let _callbacks:RecorderCallbacks<KeyBuffer, RecorderMeta>;

    const onKeyUp= (evt:KeyboardEvent) => {
        const time = performance.now() - _recordStartTime;
        _buffer.keys.push({time, key: evt.key});

        _callbacks.onMeta(some(_buffer));
    }

    const stopListeners = () => {
        document.removeEventListener("keyup", onKeyUp);
    }

    const stop = () => {
        stopListeners();
        _resolve.map(fn => fn());
        _resolve= none;
    }

    const start = async (callbacks:RecorderCallbacks<KeyBuffer, RecorderMeta>):Promise<Option<KeyBuffer>> => {
        _recordStartTime = performance.now();
        _buffer = {keys: []};
        _callbacks = callbacks;
        document.addEventListener("keyup", onKeyUp);

        return new Promise<Option<KeyBuffer>>(resolve => {
            _resolve = some(() => {
                resolve(_buffer.keys.length ? some(_buffer) : none);
            });
        })
    }

    const dispose = () => {
        stopListeners();

        _resolve = none;
    }

    return {start, stop, dispose};
}

/*
 *
export interface RecorderCallbacks <B,M> {
    onBuffer: (buffer:Option<B>) => void;
    onMeta: (meta:Option<M>) => void;
}

export interface Recorder <B, M> {
    start: (callbacks:RecorderCallbacks<B,M>) => Promise<Option<B>>;
    stop: Thunk;
    dispose: Thunk;
}
 */
