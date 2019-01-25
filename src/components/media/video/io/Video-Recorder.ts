import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import { Option, none, some } from 'fp-ts/lib/Option';

type VideoBuffer = any;

interface RecordedMeta {
}
export const createRecorder = ():Recorder<VideoBuffer, RecordedMeta> => {
    let _recorder:Option<MediaRecorder> = none;
    let _fileReader:Option<FileReader> = none;
    let _chunks:Array<ArrayBuffer>;

    const stop = () => {
    }

    const start = async (_:RecorderCallbacks<VideoBuffer, RecordedMeta>):Promise<Option<VideoBuffer>> => {
        
        return navigator.mediaDevices.getUserMedia({video: true})
            .then((stream) => new Promise<Option<VideoBuffer>>((resolve, reject) => {
                /*
                _chunks = [];

                const fileReader = new FileReader();
                const recorder = new MediaRecorder(stream);
                
                recorder.ondataavailable = evt => {
                    _chunks.push((evt as any).data);
                }
                _recorder = some(recorder);

                recorder.onstop = () => {
                    const blob = new Blob(_chunks, { 'type' : recorder.mimeType });
                    fileReader.readAsArrayBuffer(blob);
                }

                fileReader.onloadend = () => {
                    getAudioContext().decodeAudioData(
                        fileReader.result as ArrayBuffer, 
                        audioBuffer => resolve(some(audioBuffer)), 
                        reject
                    );
                }
                _fileReader = some(fileReader);

                recorder.start();
                 */
            }))
    }

    const dispose = () => {
        _recorder.map(recorder => recorder.ondataavailable = null);
        _fileReader.map(fileReader => fileReader.onloadend = null);

        stop();

        _recorder = none;
        _fileReader = none;
        _chunks = [];
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
