import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaRecorder-Effects";
import {FutureInstance} from "fluture";
const {sendParent, log} = actions;

//These callbacks can be used to give progress reports
//Note that onBuffer _replaces_ the entire buffer
//So chunking should be handled locally
export interface RecorderCallbacks <B,M> {
    onMeta: (meta:Option<M>) => void;
}

export interface Recorder <B, M, E> {
    start: (callbacks:RecorderCallbacks<B,M>) => FutureInstance<E, Option<B>>;
    stop: Thunk;
    dispose: Thunk;
}

export interface Schema {
    states: {
        record: {};
        end: {};
    };
}

export type Event <B, M, E> =
    | { type: 'STOP' }
    | { type: 'REJECT', data: E}
    | { type: 'RESOLVE', data: B}
    | { type: 'META', data: M}

export interface Context <B, M>{
    buffer: Option<B>;
    meta: Option<M>;
}

type Config <B, M, E> = MachineConfig<Context<B, M>, Schema, Event<B, M, E>>;

const makeConfig = <B, M, E>():Config<B, M, E> => ({ 
    id: 'recording',
    initial: "record",
    context: {
        buffer: none,
        meta: none
    },
    states: {
        record: {
            invoke: {
                src: 'startRecorder',
                id: "invoked.recorder"
            },
            on: {
                STOP: {
                    actions: "stopRecorder"
                },

                /*
                 * These are intended to be called by the invoked child only
                 */

                META: {
                    actions: ["updateMeta", "updateParentMeta"]
                },

                RESOLVE: {
                    target: 'end',
                    actions: 'replaceBuffer'
                },
                REJECT: {
                    actions: sendParent((_, evt) => evt)
                },
            }, 
        },

        end: {
            type: "final",
            data: {
                buffer: (ctx:Context<B, M>) => ctx.buffer,
            }
        },
    }
})

const makeOptions = <B, M, E>(createRecorder:() => Recorder<B, M, E>):any => ({
    actions: makeActions(),
    services: makeServices<B, M, E>(createRecorder),
})

export const makeMachine = <B, M, E>(createRecorder: () => Recorder<B, M, E>) =>  
    Machine<Context<B, M>, Schema, Event<B, M, E>>(makeConfig(), makeOptions(createRecorder));
