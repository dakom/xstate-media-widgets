import {Player} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {getAudioContext} from "./Audio-Context";

export type PlayerMeta = void;

//Although it's a Blob here, it's probably RecorderBuffer from MediaBlob-Recorder
//They are aliases for now ;)
export const createPlayer = ():Player<Blob, PlayerMeta> => {
    let _fileReader:Option<FileReader> = none;
    let _node:Option<AudioBufferSourceNode> = none;
    let _resolve:Option<Thunk> = none;

    const stopPlayback = () => {
        _node.map(node => node.stop());
        _fileReader.map(fileReader => fileReader.onloadend = null);
        _node = none;
        _fileReader = none;
    }

    //This will force the promise created in start() to resolve
    const stop = () => {
        stopPlayback();
        _resolve.map(fn => fn());
        _resolve= none;
    }

    const start = (blob:Blob) => (_: (meta:PlayerMeta) => void) => {
        //Multi-channel playing should be done in a proper mixer
        stopPlayback();

        return new Promise<void>((resolve, reject) => {
            _resolve = some(resolve);

            const fileReader = new FileReader();
            _fileReader = some(fileReader);
            
            fileReader.onloadend = () => {
                getAudioContext().decodeAudioData(
                    fileReader.result as ArrayBuffer, 
                    audioBuffer => {
                        const node = getAudioContext().createBufferSource();
                        _node = some(node);
                        node.buffer = audioBuffer; 
                        node.connect(getAudioContext().destination);
                        node.onended = stop;
                        node.start();
                    },
                    reject
                );
            }

            fileReader.readAsArrayBuffer(blob);
        });
    };

    const dispose = () => {
        stopPlayback();
        _resolve = none;
    }

    return {start, stop, dispose};
}
