import {createElement as el} from "react";
import {View, ViewProps, ConfigurableViewProps, ActiveMode} from "./view/MediaController-View";
import {Context, Schema, Event} from "./machine/MediaController-Machine";
import {MachineHook, arrayHas, makeEventSender} from "utils/Utils";
import {OmniEvent} from "xstate";
import {some, none } from 'fp-ts/lib/Option'

interface Props <B, PM, RM, PE, RE> extends ConfigurableViewProps {
    machineHook: MachineHook<Context<B, PM, RM>, Schema, Event<PM, RM, PE, RE>>;
}

export const MediaController = <B, PM, RM, PE, RE>({machineHook, iconOverrides}:Props<B, PM, RM, PE, RE>) => {
    type MediaEvent = OmniEvent<Event<PM, RM, PE, RE>>;

    const {state, service, context} = machineHook; 

    //console.log(state.value);

    //Little helper to just create a call to send(event)
    //But only in the case where that next event is valid
    //Returns it as an Option
    const makeEventHandler = (evt:MediaEvent) =>
        makeEventSender (service) (arrayHas(state.nextEvents as Array<MediaEvent>)) (evt) (evt)

    //View is just an expression of state 
    //It's up to the component here to set the right props
    //Thankfully it flows declaratively from the state machine!
    //(we could just pass state/context etc. but it's nicer to decouple)
    const props:ViewProps = {
        iconOverrides, 
        onStop: makeEventHandler("STOP"),
        onPlay: context.buffer.chain(() => makeEventHandler("PLAY")),
        onRecord: makeEventHandler("RECORD"),
        onErase: context.buffer.chain(() => makeEventHandler("ERASE")),
        activeMode: 
            state.matches("playing") ?  some(ActiveMode.PLAY) 
            : state.matches("recording") ?  some(ActiveMode.RECORD) 
            : none
    }

    return el(View, props);
}
