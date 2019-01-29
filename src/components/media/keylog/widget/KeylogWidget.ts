import {createElement as el, useMemo} from "react";
import {View, KeyList} from "./view/KeylogWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer, PlayerMeta, PlayerError} from "components/media/keylog/io/Keylog-Player";
import {createRecorder, RecorderMeta, RecorderError} from "components/media/keylog/io/Keylog-Recorder";
import {KeyBuffer} from "components/media/keylog/types/Keylog-Types";
import { Option, none, some } from 'fp-ts/lib/Option';
import {Clock} from "components/time/clock/Clock";

export const KeylogWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const controllerMachineHook = useMachine(() => makeMediaControllerMachine<KeyBuffer, PlayerMeta, RecorderMeta, PlayerError, RecorderError>
        (createPlayer)
        (createRecorder)
        ({
            startTime: () => clockMachineHook.service.send("START"),
            stopTime: () => clockMachineHook.service.send("STOP"),
            resetTime: () => clockMachineHook.service.send("RESET"),
            handleFail: () => alert("got fail!")
        })
    );

    const keyList:Option<KeyBuffer> = 
        controllerMachineHook.state.matches("playing") ? controllerMachineHook.context.playerMeta
        : controllerMachineHook.state.matches("recording") ? controllerMachineHook.context.recorderMeta
        : none as Option<KeyBuffer>;

    const mKeys = keyList.map(buffer => buffer.keys.map(k => k.key));


    return el(View, null, addElementKeys([
        el(MediaController, {
            machineHook: controllerMachineHook,
            iconOverrides: {
                record: "fas fa-keyboard"
            }
        }),

        el(Clock, {machineHook: clockMachineHook}),

        mKeys.map(keys => el(KeyList, {keys})).getOrElse(null)

    ]));

}
