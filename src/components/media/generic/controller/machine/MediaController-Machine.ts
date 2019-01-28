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

export type Event <PM, RM>=
    | { type: 'STOP' }
    | { type: 'PLAY' }
    | { type: 'RECORD' }
    | { type: 'ERASE' }
    | { type: 'META', data: PM | RM}
    | { type: 'FAIL', reason: "player" | "recorder"};

export interface Context <B, PM, RM> {
    buffer: Option<B>;
    playerMeta: Option<PM>;
    recorderMeta: Option<RM>;
}

const makeConfig = <B, PM, RM>():MachineConfig<Context<B, PM, RM>, Schema, Event<PM, RM>> => ({
    id: 'controller',
    initial: "empty",
    context: {
        buffer: none,
        playerMeta: none,
        recorderMeta: none,
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
                PLAY: {
                    target: "playing",
                    cond: (ctx, _) => ctx.buffer.isSome()
                },
                RECORD: "recording",
                ERASE: {
                    target: "empty",
                    cond: (ctx, _) => ctx.buffer.isSome()
                }
            },
            onEntry: ['stopTime', 'clearMeta']
        },

        recording: {
            onEntry: [
                'eraseBuffer', 
                'resetTime', 
                'startTime',
            ],
            on: {
                STOP: {
                    actions: send('STOP', {to: "invoked.recorder"}),
                },
                //expected to be called from child
                META: {
                    actions: "updateRecorderMeta"
                },
                FAIL: "fail"
            },
            invoke: {
                src: 'recorderMachine',
                id: 'invoked.recorder',
                onDone: {
                    target: 'stopped',
                    actions: 'onRecordingFinished' 
                },
            },
        },

        playing: {
            on: {
                STOP: {
                    actions: send('STOP', {to: "invoked.player"})
                },
                //expected to be called from child
                META: {
                    actions: "updatePlayerMeta"
                },
                FAIL: "fail"
            },

            invoke: {
                src: 'playerMachine',
                id: 'invoked.player',
                onDone: {
                    target: "stopped" 
                },
                data: {
                    buffer: (parentContext:Context<B, PM, RM>) => {
                        return parentContext.buffer
                    },
                    node: () => none
                }
            },
            onEntry: [
                'startTime',
            ]
        },


        fail: {
            type: "final",
            onEntry: 'handleFail' 
        },
    }
})

const makeOptions = <B, PM, RM> (createPlayer: () => Player<B, PM>) => (createRecorder: () => Recorder<B, RM>) => (props:ActionProps) => {
    return {
        actions: makeActions(props),
        services: makeServices(createPlayer) (createRecorder)
    } as any
}


export const makeMachine = <B, PM, RM>(createPlayer: () => Player<B, PM>) => (createRecorder: () => Recorder<B, RM>) => (props:ActionProps) =>  
    Machine<Context<B, PM, RM>, Schema, Event<PM, RM>>(makeConfig<B, PM, RM>(), makeOptions<B, PM, RM> (createPlayer) (createRecorder) (props));
