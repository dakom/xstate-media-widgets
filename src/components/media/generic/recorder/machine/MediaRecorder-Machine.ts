import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaRecorder-Effects";

const {sendParent} = actions;

export interface Recorder <B>{
    start: () => Promise<B>;
    stop: Thunk;
    dispose: Thunk;
}
export interface Schema {
    states: {
        init: {};
        record: {};
        fail: {};
        end: {};
    };
}

export type Event =
    | { type: 'STOP' }
    | { type: 'RECORD' }

export interface Context <B>{
    buffer: Option<B>;
    recorder: Option<Recorder<B>>;
}

type Config <B> = MachineConfig<Context<B>, Schema, Event>;

const makeConfig = <B>():Config<B> => ({ 
    id: 'recording',
    initial: "init",
    context: {
        buffer: none,
        recorder: none,
    },
    states: {
        init: {
            onEntry: 'createRecorder',
            on: {
                RECORD: "record"
            }
        },
        record: {
            on: {
                STOP: {
                    actions: "stopRecorder"
                }
            }, 
            invoke: {
                src: 'startRecorder',
                onDone: {
                    target: 'end',
                    actions: 'stashRecording'
                },

                onError: {
                    target: 'fail',
                }
            },
        },

        end: {
            type: "final",
            data: {
                buffer: (ctx:Context<B>) => ctx.buffer
            }
        },

        fail: {
            type: "final",
            onEntry: sendParent({type: "FAIL", reason: "recorder"})
        }
    }
})

const makeOptions = <B>(createRecorder:() => Recorder<B>):any => ({
    actions: makeActions(createRecorder),
    services: makeServices<B>(),
})

export const makeMachine = <B>(createRecorder: () => Recorder<B>) =>  
    Machine<Context<B>, Schema, Event>(makeConfig(), makeOptions(createRecorder));
