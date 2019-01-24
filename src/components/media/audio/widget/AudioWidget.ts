import {createElement as el, useMemo} from "react";
import {View} from "./view/AudioWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer} from "components/media/audio/io/Audio-Player";
import {createRecorder} from "components/media/audio/io/Audio-Recorder";
import {Clock} from "components/time/clock/Clock";

export const AudioWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const audioControllerMachineHook = useMachine(() => makeMediaControllerMachine
        (createPlayer)
        (createRecorder)
        ({
        startTime: () => clockMachineHook.service.send("START"),
        stopTime: () => clockMachineHook.service.send("STOP"),
        resetTime: () => clockMachineHook.service.send("RESET"),
        handleFail: () => alert("got fail!")
        })
    );

    console.log(audioControllerMachineHook.state.value);

    return el(View, null, addElementKeys([
        el(MediaController, {machineHook: audioControllerMachineHook}),
        el(Clock, {machineHook: clockMachineHook})
    ]));

}
