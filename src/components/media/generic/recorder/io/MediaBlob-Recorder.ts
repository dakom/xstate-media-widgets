import {RefObject} from "react";
import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import {MediaBuffer} from "components/media/generic/types/Media-Types";
import { Option, none, some } from 'fp-ts/lib/Option';
import {tryP, Future, FutureInstance} from "fluture";

export type RecorderError = string;

export interface RecorderMeta {
    stream:MediaStream;
}

export interface RecordingOptions {
    video?: any; //e.g. {deviceId: {exact: "MyDeviceId"}}
    audio?: boolean;
}

export const createRecorder = (opts:RecordingOptions) => {


    return ():Recorder<MediaBuffer, RecorderMeta, RecorderError> => {
        let _recorder:Option<MediaRecorder> = none;
        let _chunks:Array<ArrayBuffer>;

        const stop = () => {

            _recorder.map(recorder => {
                recorder.stop();
                recorder.stream.getTracks().forEach(i => i.stop())
            });
            _recorder = none;
        }

        const start = (callbacks:RecorderCallbacks<MediaBuffer, RecorderMeta>):FutureInstance<RecorderError, Option<MediaBuffer>> => {
            const futureDevice:FutureInstance<any, MediaStream> = tryP(() => navigator.mediaDevices.getUserMedia(opts));

            return futureDevice.chain((stream) => 
                new Future<RecorderError, Option<MediaBuffer>>((reject, resolve)  => {
                    callbacks.onMeta(some({
                        stream
                    }));

                    _chunks = [];

                    const recorder = new MediaRecorder(stream);
                    _recorder = some(recorder);

                    recorder.ondataavailable = evt => {
                        _chunks.push((evt as any).data);
                    }

                    recorder.onstop = () => {
                        resolve(some(new Blob(_chunks, { 'type' : recorder.mimeType })));
                    }
                    
                    recorder.start();
                })
            )
        }

        const dispose = () => {
            _recorder.map(recorder => recorder.ondataavailable = null);

            stop();

            _recorder = none;
            _chunks = [];
        }

        return {start, stop, dispose};
    }
}
