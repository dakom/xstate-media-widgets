import {Player} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {getAudioContext} from "./Audio-Context";

interface PlayerMeta {
}

export const createPlayer = ():Player<AudioBuffer, PlayerMeta> => {
    let _node:Option<AudioBufferSourceNode> = none;
    let _stop:Option<Thunk> = none;

    const stopPlayback = () => {
        _node.map(node => node.stop());
        _node = none;
    }

    const stop = () => _stop.map(fn => fn());

    const start = (buffer:AudioBuffer) => (_: (meta:PlayerMeta) => void) => {

        //Multi-channel playing should be done in a proper mixer
        stopPlayback();

        const node = getAudioContext().createBufferSource();
        node.buffer = buffer; 
        node.connect(getAudioContext().destination);
        node.onended = stop;
        _node = some(node);

        const promise = new Promise<void>(resolve => {
            _stop = some(() => {
                stopPlayback();
                resolve();
                _stop = none;
            });
        });

        node.start();
        return promise;
    };

    const dispose = () => {
        stopPlayback();
        _stop = none;
    }

    return {start, stop, dispose};
}
