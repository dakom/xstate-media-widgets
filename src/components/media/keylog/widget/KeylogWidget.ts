import {createElement as el, useMemo} from "react";
import {View} from "./view/KeylogWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer} from "components/media/keylog/io/Keylog-Player";
import {createRecorder} from "components/media/keylog/io/Keylog-Recorder";
import {Clock} from "components/time/clock/Clock";

export const KeylogWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const videoControllerMachineHook = useMachine(() => makeMediaControllerMachine
        (createPlayer)
        (createRecorder)
        ({
            startTime: () => clockMachineHook.service.send("START"),
            stopTime: () => clockMachineHook.service.send("STOP"),
            resetTime: () => clockMachineHook.service.send("RESET"),
            handleFail: () => alert("got fail!")
        })
    );

    return el(View, null, addElementKeys([
        el(MediaController, {machineHook: videoControllerMachineHook}),
        el(Clock, {machineHook: clockMachineHook})
    ]));

}
