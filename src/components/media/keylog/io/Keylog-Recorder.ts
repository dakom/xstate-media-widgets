import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import { Option, none, some } from 'fp-ts/lib/Option';

type KeylogBuffer = any;

interface RecordedMeta {
}
export const createRecorder = ():Recorder<KeylogBuffer, RecordedMeta> => {
    const stop = () => {
    }

    const start = async (_:RecorderCallbacks<KeylogBuffer, RecordedMeta>):Promise<Option<KeylogBuffer>> => {
        return new Promise<Option<KeylogBuffer>>(resolve => {
        })
    }

    const dispose = () => {
        stop();
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
