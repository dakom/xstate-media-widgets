import {RefObject} from "react";
import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import { Option, none, some } from 'fp-ts/lib/Option';

export type RecorderBuffer = Blob;
export type RecorderMeta = void;

export interface RecordingOptions {
    video?: any; //e.g. {deviceId: {exact: "MyDeviceId"}}
    audio?: boolean;
    videoRef?: RefObject<HTMLVideoElement>;
}

export const createRecorder = (opts:RecordingOptions) => {


    return ():Recorder<RecorderBuffer, RecorderMeta> => {
        let _recorder:Option<MediaRecorder> = none;
        let _chunks:Array<ArrayBuffer>;

        const stop = () => {
            if(opts.videoRef && opts.videoRef.current) {
                opts.videoRef.current.src = "";
            }

            _recorder.map(recorder => {
                recorder.stop();
                recorder.stream.getTracks().forEach(i => i.stop())
            });
            _recorder = none;
        }

        const start = async (_:RecorderCallbacks<RecorderBuffer, RecorderMeta>):Promise<Option<RecorderBuffer>> => {

            console.log(opts);

            return navigator.mediaDevices.getUserMedia(opts)
                .then((stream) => new Promise<Option<RecorderBuffer>>(resolve  => {
                    if(opts.videoRef && opts.videoRef.current) {
                        opts.videoRef.current.srcObject = stream;
                        opts.videoRef.current.play();
                    }

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
                }))
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
