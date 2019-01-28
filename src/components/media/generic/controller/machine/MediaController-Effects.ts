import {DoneInvokeEvent, actions} from 'xstate';
import {Option, some, none} from 'fp-ts/lib/Option';
import {Thunk} from "utils/Utils";
import {Context} from "./MediaController-Machine";
import {makeMachine as makeRecorderMachine, Recorder} from "components/media/generic/recorder/machine/MediaRecorder-Machine";
import {makeMachine as makePlayerMachine, Player} from "components/media/generic/player/machine/MediaPlayer-Machine";
const {assign} = actions;

export interface ActionProps {
    startTime: Thunk;
    stopTime: Thunk;
    resetTime: Thunk;
    handleFail: Thunk;
}

export const makeActions = <B, PM, RM>(props:ActionProps) => {
    return {
        ...props,
        eraseBuffer: assign({
            buffer: () => none
        }),
        onRecordingFinished: assign({
            buffer: (_:Context<B, PM, RM>, evt:DoneInvokeEvent<{buffer: Option<B>}>) => evt.data.buffer
        }),
        updateRecorderMeta: assign({
            recorderMeta: (_:Context<B, PM, RM>, evt:DoneInvokeEvent<Option<RM>>) => evt.data
        }),
        updatePlayerMeta: assign({
            playerMeta: (_:Context<B, PM, RM>, evt:DoneInvokeEvent<Option<PM>>) => evt.data
        })
    }
}

export const makeServices = <B, PM, RM>(createPlayer: () => Player<B, PM>) => (createRecorder: () => Recorder<B, RM>) => ({
    playerMachine: makePlayerMachine(createPlayer),
    recorderMachine: makeRecorderMachine(createRecorder),
})
