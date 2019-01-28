import {Player, PlayerCallbacks} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {KeyBuffer, KeyEvent} from "../types/Keylog-Types";

export type PlayerMeta = KeyBuffer

export const createPlayer = ():Player<KeyBuffer, PlayerMeta> => {
    let _resolve:Option<Thunk> = none;
    
    const stop = () => {
        _resolve.map(fn => fn());
        _resolve = none;
    }

    const start = (buffer:KeyBuffer) => (callbacks:PlayerCallbacks<PlayerMeta>) => {
        return new Promise<void>(resolve => {
            _resolve = some(resolve);
        });
    };

    const dispose = () => {
    }

    return {start, stop, dispose};
}
