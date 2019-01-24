import { Machine, MachineConfig, MachineOptions} from 'xstate';
import { Option, none} from 'fp-ts/lib/Option'
import {timeActions} from "./Clock-Effects";


export interface Schema {
    states: {
        stopped: {};
        reset: {};
        ticking: {};
    };
}

export type Event =
    | { type: 'STOP' }
    | { type: 'RESET' }
    | { type: 'START' }
    | { type: 'TICK' };

export interface Context {
    elapsedTime: number;
    totalTime: Option<number>;
}

const config:MachineConfig<Context, Schema, Event> = {
    id: 'timer',
    initial: "reset",
    context: {
        elapsedTime: 0,
        totalTime: none
    },
    states: {
        stopped: {
            on: {
                RESET: "reset",
                START: "ticking",
            },
            onEntry: 'resetElapsedTime' 
        },

        ticking: {
            on: {
                STOP: {
                    target: "stopped",
                    actions: 'stashTotalTime'
                },
                RESET: "reset",
                TICK: { 
                    actions: 'incrementElapsedTime' 
                }
            },
            invoke: {
                id: 'tickInterval',
                src: () => (callback) => {
                  const id = setInterval(() => callback('TICK'), 1000);

                  return () => clearInterval(id);
                }
            }
        },

        reset: {
            on: {
                ['' as any]: "stopped"
            },
            onEntry: 'resetTotalTime'
        },
    }
}

const options:MachineOptions<Context, Event> = {
    actions: timeActions
}

export const makeMachine = () =>  
    Machine<Context, Schema, Event>(config, options);
