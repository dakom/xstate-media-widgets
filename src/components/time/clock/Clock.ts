import {createElement as el} from "react";
import {View, ViewProps} from "./view/Clock-View";
import {Context, Schema, Event} from "./machine/Clock-Machine";
import {MachineHook, getTimecode} from "utils/Utils";
import {none} from 'fp-ts/lib/Option'

interface Props {
    machineHook: MachineHook<Context, Schema, Event>;
}

export const Clock = ({machineHook}:Props) => {
    const {state, context} = machineHook;

    const props:ViewProps = {
        elapsed: getTimecode(context.elapsedTime),
        total: state.matches("ticking")
            ? context.totalTime.map(getTimecode)
            : none
    }

    return el(View, props);
}
