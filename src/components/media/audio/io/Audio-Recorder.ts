import {Recorder, RecorderCallbacks} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import { Option, none, some } from 'fp-ts/lib/Option';
import {getAudioContext} from "./Audio-Context";

interface RecordedMeta {
}
export const createRecorder = ():Recorder<AudioBuffer, RecordedMeta> => {
    let _recorder:Option<MediaRecorder> = none;
    let _fileReader:Option<FileReader> = none;

    const stop = () => {
        _recorder.map(recorder => {
            recorder.stop();
            recorder.stream.getTracks().forEach(i => i.stop())
        });
        _recorder = none;
    }

    const start = async (_:RecorderCallbacks<AudioBuffer, RecordedMeta>):Promise<Option<AudioBuffer>> => {

        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => new Promise<Option<AudioBuffer>>((resolve, reject) => {
                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = evt => {
                    fileReader.readAsArrayBuffer((evt as any).data);
                }
                _recorder = some(recorder);

                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    getAudioContext().decodeAudioData(
                        fileReader.result as ArrayBuffer, 
                        audioBuffer => resolve(some(audioBuffer)), 
                        reject
                    );
                }
                _fileReader = some(fileReader);

                recorder.start();
            }))
    }

    const dispose = () => {
        _recorder.map(recorder => recorder.ondataavailable = null);
        _fileReader.map(fileReader => fileReader.onloadend = null);

        stop();

        _recorder = none;
        _fileReader = none;
    }

    return {start, stop, dispose};
}
