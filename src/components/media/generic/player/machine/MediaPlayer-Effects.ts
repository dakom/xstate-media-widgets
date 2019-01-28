import {DoneInvokeEvent, actions} from 'xstate';
import {Option, none, some} from 'fp-ts/lib/Option'
import {Context, Player} from "./MediaPlayer-Machine";

const {assign, send, sendParent} = actions;

export const makeActions = <B, M>() => ({

    stopPlayer: send("STOP", {to: "invoked.player"}),

    updateMeta: assign({
        meta: (_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => evt.data
    }),

    updateParentMeta: (_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => sendParent(evt)
})

export const makeServices = <B, M>(createPlayer:() => Player<B, M>) => ({
    startPlayer: (ctx:Context<B, M>) => (cbSend, onEvent) => {
        const player = createPlayer();
        ctx.buffer.map(buffer => {
            player.start
                (buffer)
                (meta => sendParent({type: "META", data: meta}))
                .then(() => cbSend("DONE"))
        })

        onEvent(evt => {
            if(evt.type === "STOP") {
                player.stop();
            }
        });
        return player.dispose;
    }
})

