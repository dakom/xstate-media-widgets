import { actions} from 'xstate';
import {Option, none, some} from 'fp-ts/lib/Option'
import {Context, Player} from "./MediaPlayer-Machine";

const {assign} = actions;

export const makeActions = <B>(createPlayer:() => Player<B>) => ({
    createPlayer: assign({
        player: () => some(createPlayer()),
    }),

    disposePlayer: assign({
        player: (ctx:Context<B>) => {
            ctx.player.map(player => player.dispose());
            return none as Option<Player<B>>
        }
    }),

    stopPlayer: (ctx:Context<B>) => {
        ctx.player.map(player => player.stop())
    }
})

export const makeServices = <B>() => ({
    startPlayer: (ctx:Context<B>) => 
    new Promise<void>((resolve) => {
            ctx.player.map(player => {
                ctx.buffer.map(buffer => {
                    player.start(buffer).then(resolve)
                })
            })
        })
})

/*
const makeActions = <B>() => ({
    createPlayer: assign({
        node: (ctx:Context<B>) => 
            ctx.buffer.map(audioBuffer => {
                const node = getAudioContext().createBufferSource();
                node.buffer = audioBuffer; 
                node.connect(getAudioContext().destination);
                return node;
            })
    }),

    clearPlaybackNode: assign({
        node: () => none as Option<AudioBufferSourceNode>
    }),

    stopPlaying: assign({
    })
}

export const playingServices = {
    onPlaybackFinished: (ctx:Context) => 
        new Promise((resolve) => 
            ctx.node.map(node => 
                node.onended = resolve
            )
        )
}

export const playingActivities = {
    beginPlaying: (ctx:Context) => {
        ctx.node.map(node => {
            node.start();
        })

        return () => ctx.node.map(node => {
            node.stop()
        });
    }
}
 */
