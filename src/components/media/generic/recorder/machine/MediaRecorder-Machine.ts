import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaRecorder-Effects";

const {sendParent, log} = actions;

//These callbacks can be used to give progress reports
//Note that onBuffer _replaces_ the entire buffer
//So chunking should be handled locally
export interface RecorderCallbacks <B,M> {
    onBuffer: (buffer:Option<B>) => void;
    onMeta: (meta:Option<M>) => void;
}

export interface Recorder <B, M> {
    start: (callbacks:RecorderCallbacks<B,M>) => Promise<Option<B>>;
    stop: Thunk;
    dispose: Thunk;
}

export interface Schema {
    states: {
        record: {};
        fail: {};
        end: {};
    };
}

export type Event <B, M> =
    | { type: 'STOP' }
    | { type: 'BUFFER', data: B}
    | { type: 'DONE', data: B}
    | { type: 'META', data: M}

export interface Context <B, M>{
    buffer: Option<B>;
    meta: Option<M>;
}

type Config <B, M> = MachineConfig<Context<B, M>, Schema, Event<B, M>>;

const makeConfig = <B, M>():Config<B, M> => ({ 
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

                BUFFER: {
                    actions: "replaceBuffer"
                },

                DONE: {
                    target: 'end',
                    actions: 'replaceBuffer'
                },
            }, 
        },

        end: {
            type: "final",
            data: {
                buffer: (ctx:Context<B, M>) => ctx.buffer,
                meta: (ctx:Context<B, M>) => ctx.meta
            }
        },

        fail: {
            type: "final",
            onEntry: sendParent({type: "FAIL", reason: "recorder"})
        }
    }
})

const makeOptions = <B, M>(createRecorder:() => Recorder<B, M>):any => ({
    actions: makeActions(),
    services: makeServices<B, M>(createRecorder),
})

export const makeMachine = <B, M>(createRecorder: () => Recorder<B, M>) =>  
    Machine<Context<B, M>, Schema, Event<B, M>>(makeConfig(), makeOptions(createRecorder));
