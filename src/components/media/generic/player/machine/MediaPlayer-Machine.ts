import { Machine, MachineConfig, actions} from 'xstate';
import {Thunk} from "utils/Utils";
import { Option, none } from 'fp-ts/lib/Option'
import {makeActions, makeServices} from "./MediaPlayer-Effects";

const {sendParent, log} = actions;

export interface Player <B>{
    start: (buffer:B) => Promise<any>;
    stop: Thunk;
    dispose: Thunk;
}

export interface Schema {
    states: {
        init: {};
        play: {};
        fail: {};
        end: {};
    };
}

export type Event =
    | { type: 'STOP' }
    | { type: 'PLAY' }

export interface Context <B> {
    buffer: Option<B>;
    player: Option<Player<B>>;
}

type Config <B> = MachineConfig<Context<B>, Schema, Event>;

const makeConfig = <B>():Config<B> => ({
    id: 'playing',
    initial: "init",
    context: {
        buffer: none,
        player: none,
    },
    states: {
        init: {
            onEntry: 'createPlayer',

            on: {
                PLAY: "play"
            }
        },
        play: {

            on: {
                STOP: {
                    actions: "stopPlayer" 
                }
            },

            invoke: {
                src: 'startPlayer',
                onDone: {
                    target: "end",
                },
                onError: {
                    target: "fail"
                }
            },

            onExit: 'disposePlayer'
        },
        
        end: {
            type: "final",
        },

        fail: {
            type: "final",
            onEntry: sendParent({type: "FAIL", reason: "player"}),
        },
    }
})

const makeOptions = <B>(createPlayer:() => Player<B>):any => ({
    actions: makeActions(createPlayer),
    services: makeServices<B>(),
})

export const makeMachine = <B>(createPlayer:() => Player<B>) =>  
    Machine<Context<B>, Schema, Event>(makeConfig<B>(), makeOptions<B>(createPlayer));
