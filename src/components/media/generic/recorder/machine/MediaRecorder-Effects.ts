import { actions, DoneInvokeEvent} from 'xstate';
import {Option, none, some } from 'fp-ts/lib/Option'
import {Recorder, Context} from "./MediaRecorder-Machine";

const {assign, sendParent} = actions;

export const makeActions = <B, M>(createRecorder:() => Recorder<B, M>) => ({
    createRecorder: assign({
        recorder: () => some(createRecorder()),
    }),

    disposeRecorder: assign({
        recorder: (ctx:Context<B, M>) => {
            ctx.recorder.map(recorder=> recorder.dispose());
            return none as Option<Recorder<B, M>>
        }
    }),

    stopRecorder: (ctx:Context<B, M>) => {
        ctx.recorder.map(recorder=> recorder.stop())
    },

    replaceBuffer: assign({
        buffer: (_:Context<B, M>, evt:DoneInvokeEvent<Option<B>>) => evt.data
    }),

    updateMeta: assign({
        meta: (_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => evt.data
    })
})

export const makeServices = <B, M>() => ({
    startRecorder: (ctx:Context<B, M>) => 
        new Promise<Option<B>>((resolve) => {
            ctx.recorder.map(recorder => {
                recorder.start({
                    onMeta: meta => sendParent({type: "META", data: meta}),
                    onBuffer: buffer => sendParent({type: "BUFFER", data: buffer})
                }).then(resolve)
            })
        })
})

