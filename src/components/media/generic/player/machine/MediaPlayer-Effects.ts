import {DoneInvokeEvent, actions} from 'xstate';
import {Option, none, some} from 'fp-ts/lib/Option'
import {Context, Player} from "./MediaPlayer-Machine";

const {assign, sendParent} = actions;

export const makeActions = <B, M>(createPlayer:() => Player<B, M>) => ({
    createPlayer: assign({
        player: () => some(createPlayer()),
    }),

    disposePlayer: assign({
        player: (ctx:Context<B, M>) => {
            ctx.player.map(player => player.dispose());
            return none as Option<Player<B, M>>
        }
    }),

    stopPlayer: (ctx:Context<B, M>) => {
        ctx.player.map(player => player.stop())
    },

    updateMeta: assign({
        meta: (_:Context<B, M>, evt:DoneInvokeEvent<Option<M>>) => evt.data
    })
})

export const makeServices = <B, M>() => ({
    startPlayer: (ctx:Context<B, M>) => 
        new Promise<void>((resolve) => {
            ctx.player.map(player => {
                ctx.buffer.map(buffer => {
                    player.start
                        (buffer)
                        (meta => sendParent({type: "META", data: meta}))
                            .then(resolve)
                })
            })
        })
})

