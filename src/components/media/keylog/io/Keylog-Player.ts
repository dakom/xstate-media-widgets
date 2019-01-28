import {Player, PlayerCallbacks} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Thunk} from "utils/Utils";
import { Option, none, some } from 'fp-ts/lib/Option';
import {KeyBuffer, KeyEvent} from "../types/Keylog-Types";

export type PlayerMeta = KeyBuffer

export const createPlayer = ():Player<KeyBuffer, PlayerMeta> => {
    let _resolve:Option<Thunk> = none;
    let _timeoutIds:Array<Option<number>>;


    const stopTimers = () => {
        _timeoutIds.forEach(maybeId => maybeId.map(id => 
            window.clearTimeout(id)
        ));

        _timeoutIds = [];
    }
    const stop = () => {
        stopTimers();
        _resolve.map(fn => fn());
        _resolve = none;
    }

    const start = (buffer:KeyBuffer) => (callbacks:PlayerCallbacks<PlayerMeta>) => {
        return new Promise<void>(resolve => {
            _timeoutIds = buffer.keys.map((key, index) => {
                return some(window.setTimeout(() => {
                    callbacks.onMeta(some(
                        copyBufferFrom (index) (buffer)
                    ));
                    _timeoutIds[index] = none;

                }, key.time));
            });

            _timeoutIds.push(some(window.setTimeout(() => {
                _timeoutIds[_timeoutIds.length-1] = none;
                stop();
            }, buffer.finalStop)));

            _resolve = some(resolve);
        });
    };

    const dispose = () => {
        stopTimers();
    }

    return {start, stop, dispose};
}

const copyBufferFrom = (idx:number) => (buffer:KeyBuffer):KeyBuffer => {
    return {
        keys: buffer.keys.slice(0, idx+1),
        finalStop: buffer.finalStop
    }
}
