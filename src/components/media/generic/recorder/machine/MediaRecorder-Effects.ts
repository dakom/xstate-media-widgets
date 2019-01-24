import { actions} from 'xstate';
import {Option, none, some } from 'fp-ts/lib/Option'
import {Recorder, Context} from "./MediaRecorder-Machine";

const {assign} = actions;

export const makeActions = <B>(createRecorder:() => Recorder<B>) => ({
    createRecorder: assign({
        recorder: () => some(createRecorder()),
    }),

    disposeRecorder: assign({
        recorder: (ctx:Context<B>) => {
            ctx.recorder.map(recorder=> recorder.dispose());
            return none as Option<Recorder<B>>
        }
    }),

    stopRecorder: (ctx:Context<B>) => {
        ctx.recorder.map(recorder=> recorder.stop())
    }
})

export const makeServices = <B>() => ({
    startRecorder: (ctx:Context<B>) => 
        new Promise<B>((resolve) => {
            ctx.recorder.map(recorder => {
                recorder.start().then(resolve)
            })
        })
})

/*
export const makeActions = <B>(createRecorder:() => Recorder<B>) => ({ 
    setRecorder: assign({
        recorder: (_:Context, evt:Event) => some((evt as any).data)
    }),

    stashBuffer: sendParent((_:Context, evt:any) => ({ 
        type: "STASH", 
        buffer: evt.data
    })),

    stopRecording: assign({
        recorder: (ctx:Context, _:Event) => {
            ctx.recorder.map(recorder => {
                recorder.stop();
                recorder.stream.getTracks().forEach(i => i.stop())
            })

            return none as Option<MediaRecorder>;
        }
    }),

    fail: sendParent({type: "FAIL", reason: "recorder"})
})

export const makeServices = <B>() => ({
    getMediaRecorder: () => 
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => 
                new MediaRecorder(stream)
            ),

    startMediaRecorder: (ctx:Context) => {
        return new Promise((resolve, reject) => {
            ctx.recorder.map(recorder => {
                recorder.addEventListener('dataavailable', evt => {
                        const fileReader = new FileReader();

                        fileReader.onloadend = () => {
                            const arrayBuffer = fileReader.result as ArrayBuffer;
                            getAudioContext().decodeAudioData(arrayBuffer, resolve, reject);
                        }

                        fileReader.readAsArrayBuffer((evt as any).data);
                    })
                recorder.start();
            });
        })
    },
})
 */
