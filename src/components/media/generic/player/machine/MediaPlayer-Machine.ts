import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaPlayer-Effects";
import {FutureInstance} from "fluture";
const {sendParent, log} = actions;

export interface PlayerCallbacks <M> {
    onMeta: (meta:Option<M>) => void;
}
export interface Player <B, M, E> {
    start: (buffer:B) => (callbacks:PlayerCallbacks<M>) => FutureInstance<E, void>;
    stop: Thunk;
    dispose: Thunk;
}

export interface Schema {
    states: {
        play: {};
        fail: {};
        end: {};
    };
}

export type Event <M, E> =
    | { type: 'STOP' }
    | { type: 'RESOLVE' }
    | { type: 'REJECT', data: E}
    | { type: 'META', data: M}

export interface Context <B, M> {
    buffer: Option<B>;
    meta: Option<M>;
}

type Config <B, M, E> = MachineConfig<Context<B, M>, Schema, Event<M, E>>;

const makeConfig = <B, M, E>():Config<B, M, E> => ({
    id: 'playing',
    initial: "play",
    context: {
        buffer: none,
        meta: none,
    },
    states: {
        play: {

            on: {
                STOP: {
                    actions: "stopPlayer" 
                },

                /*
                 * These are intended to be called by the invoked child only
                 */
                META: {
                    actions: ["updateMeta", "updateParentMeta"]
                },

                RESOLVE: {
                    target: "end"
                },

                REJECT: {
                    target: "fail",
                    actions: sendParent((_, evt) => evt)
                }
            },

            invoke: {
                src: 'startPlayer',
                id: "invoked.player"
            },
        },
        
        end: {
            type: "final",
        },

        fail: {
            type: "final",
        },
    }
})

const makeOptions = <B, M, E>(createPlayer:() => Player<B, M, E>):any => ({
    actions: makeActions(),
    services: makeServices<B, M, E>(createPlayer),
})

export const makeMachine = <B, M, E>(createPlayer:() => Player<B, M, E>) =>  
    Machine<Context<B, M>, Schema, Event<M, E>>(makeConfig(), makeOptions(createPlayer));
