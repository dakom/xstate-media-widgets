import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {KeyBuffer, KeyEvent} from "../types/Keylog-Types";
import {Future, FutureInstance} from "fluture";
export type RecorderError = string;
export type RecorderMeta = KeyBuffer;

export const createRecorder = ():Recorder<KeyBuffer, RecorderMeta, RecorderError> => {
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

    const start = (callbacks:RecorderCallbacks<KeyBuffer, RecorderMeta>):FutureInstance<RecorderError, Option<KeyBuffer>> => {
        _recordStartTime = performance.now();
        _buffer = {keys: [], finalStop: 0};
        _callbacks = callbacks;
        document.addEventListener("keyup", onKeyUp);

        return new Future<RecorderError, Option<KeyBuffer>>((reject, resolve) => {
            _resolve = some(() => {
                _buffer.finalStop = performance.now() - _recordStartTime;
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

