import { Machine, MachineConfig, actions} from 'xstate';
import { Option, none } from 'fp-ts/lib/Option'
import {useMachine as _useMachine} from "utils/Utils";
import {ActionProps, makeActions, makeServices} from "./MediaController-Effects";
import {Player} from "components/media/generic/player/machine/MediaPlayer-Machine";
import {Recorder} from "components/media/generic/recorder/machine/MediaRecorder-Machine";

const {send, log} = actions;

export interface Schema {
    states: {
        empty: {};
        stopped: {};
        playing: {};
        recording: {};
        fail: {};
    };
}

export type Event =
    | { type: 'STOP' }
    | { type: 'PLAY' }
    | { type: 'RECORD' }
    | { type: 'ERASE' }
    | { type: 'FAIL', reason: "player" | "recorder"};

export interface Context <B> {
    buffer: Option<B>;
}

const makeConfig = <B>():MachineConfig<Context<B>, Schema, Event> => ({
    id: 'controller',
    initial: "empty",
    context: {
        buffer: none,
    },
    states: {
        empty: {
            on: {
                RECORD: "recording"
            },

            onEntry: ['eraseBuffer', 'resetTime']
        },

        stopped : {
            on: {
                PLAY: "playing",
                RECORD: "recording",
                ERASE: "empty"
            },
            onEntry: 'stopTime'
        },

        playing: {
            on: {
                STOP: {
                    actions: send('STOP', {to: "invoke.player"})
                },
                FAIL: "fail"
            },
            invoke: {
                src: 'playerMachine',
                id: 'invoke.player',
                onDone: {
                    target: "stopped" 
                },
                data: {
                    buffer: (parentContext:Context<B>) => {
                        return parentContext.buffer
                    },
                    node: () => none
                }
            },
            onEntry: 'startTime' 
        },

        recording: {
            on: {
                STOP: {
                    actions: send('STOP', {to: "invoke.recorder"}),
                },
                FAIL: "fail"
            },
            invoke: {
                src: 'recorderMachine',
                id: 'invoke.recorder',
                onDone: {
                    target: 'stopped',
                    actions: 'stashBuffer' 
                },
            },
            onEntry: ['eraseBuffer', 'resetTime', 'startTime']
        },

        fail: {
            type: "final",
            onEntry: 'handleFail' 
        },
    }
})

const makeOptions = <B> (createPlayer: () => Player<B>) => (createRecorder: () => Recorder<B>) => (props:ActionProps) => {
    return {
        actions: makeActions(props),
        services: makeServices(createPlayer) (createRecorder)
    } as any
}


export const makeMachine = <B>(createPlayer: () => Player<B>) => (createRecorder: () => Recorder<B>) => (props:ActionProps) =>  
    Machine<Context<B>, Schema, Event>(makeConfig<B>(), makeOptions<B> (createPlayer) (createRecorder) (props));
