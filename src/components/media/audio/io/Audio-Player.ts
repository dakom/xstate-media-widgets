import {Player} from "components/media/generic/player/machine/MediaPlayer-Machine";

/*
 *
export interface Player <B>{
    start: (buffer:B) => Promise<any>;
    stop: Thunk;
    dispose: Thunk;
}
 */
export const createPlayer = ():Player<AudioBuffer> => {
    return {};
}
