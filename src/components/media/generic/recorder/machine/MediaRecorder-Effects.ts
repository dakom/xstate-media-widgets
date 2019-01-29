import { actions, DoneInvokeEvent} from 'xstate';
import {Option, none, some } from 'fp-ts/lib/Option'
import {Recorder, Context, Event} from "./MediaRecorder-Machine";

const {assign, sendParent, send} = actions;

export const makeActions = <B, M>() => ({

    stopRecorder: send("STOP", {to: "invoked.recorder"}),

    replaceBuffer: assign({
        buffer: (_:Context<B, M>, evt:DoneInvokeEvent<Option<B>>) => evt.data
    }),

    updateMeta: assign({
        meta: (_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => evt.data
    }),

    updateParentMeta: sendParent((_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => evt)
})

export const makeServices = <B, M, E>(createRecorder:() => Recorder<B, M, E>) => ({
    startRecorder: (ctx:Context<B, M>, evt:Event<B, M, E>) => (cbSend, onEvent) => {
        const recorder = createRecorder();

        recorder.start({
            onMeta: meta => cbSend({type: "META", data: meta}),
        }).fork(
            err => cbSend({type: "REJECT", data: err}),
            buffer => cbSend({type: "RESOLVE", data: buffer})
        )


        onEvent(evt => {
            if(evt.type === "STOP") {
                recorder.stop();
            }
        });

        return recorder.dispose    
    }
})
