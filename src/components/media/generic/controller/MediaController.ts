import {createElement as el} from "react";
import {View, ViewProps, ActiveMode} from "./view/MediaController-View";
import {Context, Schema, Event} from "./machine/MediaController-Machine";
import {MachineHook, arrayHas, makeEventSender} from "utils/Utils";
import {OmniEvent} from "xstate";
import {some, none } from 'fp-ts/lib/Option'

interface Props <B> {
    machineHook: MachineHook<Context<B>, Schema, Event>;
}

export const MediaController = <B>({machineHook}:Props<B>) => {
    const {state, service} = machineHook; 

    //console.log(state.value);

    //Little helper to just create a call to send(event)
    //But only in the case where that next event is valid
    //Returns it as an Option
    const makeEventHandler = (evt:OmniEvent<Event>) =>
        makeEventSender (service) (arrayHas(state.nextEvents as Array<OmniEvent<Event>>)) (evt) (evt)

    //View is just an expression of state 
    //It's up to the component here to set the right props
    //Thankfully it flows declaratively from the state machine!
    //(we could just pass state/context etc. but it's nicer to decouple)
    const props:ViewProps = {
        onStop: makeEventHandler("STOP"),
        onPlay: makeEventHandler("PLAY"),
        onRecord: makeEventHandler("RECORD"),
        onErase: makeEventHandler("ERASE"),
        activeMode: 
            state.matches("playing") ?  some(ActiveMode.PLAY) 
            : state.matches("recording") ?  some(ActiveMode.RECORD) 
            : none
    }

    return el(View, props);
}