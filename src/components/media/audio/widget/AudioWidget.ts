import {createElement as el} from "react";
import {View} from "./view/AudioWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer, PlayerMeta, PlayerError} from "components/media/audio/io/Audio-Player";
import {createRecorder, RecorderMeta, RecorderError} from "components/media/generic/recorder/io/MediaBlob-Recorder";
import {MediaBuffer} from "components/media/generic/types/Media-Types";
import {Clock} from "components/time/clock/Clock";

export const AudioWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const controllerMachineHook = useMachine(() => makeMediaControllerMachine<MediaBuffer, PlayerMeta, RecorderMeta, PlayerError, RecorderError>
        (createPlayer)
        (createRecorder ({audio: true}))
        ({
            startTime: () => clockMachineHook.service.send("START"),
            stopTime: () => clockMachineHook.service.send("STOP"),
            resetTime: () => clockMachineHook.service.send("RESET"),
            handleFail: () => alert("got fail!")
        })
    );

    return el(View, null, addElementKeys([
        el(MediaController, {machineHook: controllerMachineHook}),
        el(Clock, {machineHook: clockMachineHook})
    ]));

}
