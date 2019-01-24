import {Recorder} from "components/media/generic/recorder/machine/MediaRecorder-Machine";

/*
export interface Recorder <B>{
    start: () => Promise<B>;
    stop: Thunk;
    dispose: Thunk;
}
 */
export const createRecorder = ():Recorder<AudioBuffer> => {
    return {};
}
