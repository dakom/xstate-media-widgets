import {Player, PlayerCallbacks} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';

type VideoBuffer = any;

export interface PlayerMeta {
    url:string;
}

export const createPlayer = ():Player<Blob, PlayerMeta> => {
    let _resolve:Option<Thunk> = none;

    const stop = () => {
        _resolve.map(fn => fn());
        _resolve= none;
    }

    const start = (blob:Blob) => (callbacks:PlayerCallbacks<PlayerMeta>) => {
        return new Promise<void>(resolve => {

            callbacks.onMeta(some({url: URL.createObjectURL(blob)}));

            _resolve = some(resolve);
        });
    };

    const dispose = () => {
        _resolve = none;
    }

    return {start, stop, dispose};
}
