import { actions} from 'xstate';
import { Option, none, some } from 'fp-ts/lib/Option'
import {Context} from "./Clock-Machine";

const {assign} = actions

export const timeActions = {
        resetElapsedTime: assign({
            elapsedTime: () => 0
        }),
        resetTotalTime: assign({
            totalTime: () => none as Option<number>
        }),
        incrementElapsedTime: assign({
            elapsedTime: (ctx:Context) => ctx.elapsedTime + 1
        }),
        stashTotalTime: assign({
            totalTime: (ctx:Context) => ctx.totalTime.isNone()
                ? some(ctx.elapsedTime)
                : ctx.totalTime
        })
    }

