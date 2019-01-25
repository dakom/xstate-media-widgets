import {Player} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';

type VideoBuffer = any;

export interface PlayerMeta {
}

export const createPlayer = ():Player<Blob, PlayerMeta> => {

    const stop = () => {
    }

    const start = (blob:Blob) => (_: (meta:PlayerMeta) => void) => {
        return new Promise<void>(resolve => {
        });
    };

    const dispose = () => {
    }

    return {start, stop, dispose};
}
/*
 *
export interface Player <B, M> {
    start: (buffer:B) => (onMeta: (meta:M) => void) => Promise<void>;
    stop: Thunk;
    dispose: Thunk;
}
 */
