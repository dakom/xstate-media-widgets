import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaPlayer-Effects";

const {sendParent, log} = actions;

export interface Player <B, M> {
    start: (buffer:B) => (onMeta: (meta:M) => void) => Promise<void>;
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

export type Event <M> =
    | { type: 'STOP' }
    | { type: 'DONE' }
    | { type: 'META', data: M}

export interface Context <B, M> {
    buffer: Option<B>;
    meta: Option<M>;
}

type Config <B, M> = MachineConfig<Context<B, M>, Schema, Event<M>>;

const makeConfig = <B, M>():Config<B, M> => ({
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

                DONE: {
                    target: "end"
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
            onEntry: sendParent({type: "FAIL", reason: "player"}),
        },
    }
})

const makeOptions = <B, M>(createPlayer:() => Player<B, M>):any => ({
    actions: makeActions(),
    services: makeServices<B, M>(createPlayer),
})

export const makeMachine = <B, M>(createPlayer:() => Player<B, M>) =>  
    Machine<Context<B, M>, Schema, Event<M>>(makeConfig(), makeOptions(createPlayer));
