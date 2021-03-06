import {createElement as el, useRef, useMemo, useState, useEffect} from "react";
import { Option, none, some } from 'fp-ts/lib/Option';
import {View, Video, DevicePicker} from "./view/VideoWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer, PlayerMeta, PlayerError} from "components/media/video/io/Video-Player";
import {MediaBuffer} from "components/media/generic/types/Media-Types";
import {createRecorder, RecorderMeta, RecorderError} from "components/media/generic/recorder/io/MediaBlob-Recorder";
import {Clock} from "components/time/clock/Clock";

export const VideoWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const [devices, setDevices] = useState<Option<Array<MediaDeviceInfo>>>(none);

    const [activeDevice, setActiveDevice] = useState<Option<string>>(none);

    const recordingOptions = { 
        video: activeDevice.map(exact => ({deviceId: {exact}})).getOrElse(true as any),
    }

    const controllerMachineHook = useMachine(() => makeMediaControllerMachine<MediaBuffer, PlayerMeta, RecorderMeta, PlayerError, RecorderError>
        (createPlayer)
        (createRecorder(recordingOptions))
        ({
            startTime: () => clockMachineHook.service.send("START"),
            stopTime: () => clockMachineHook.service.send("STOP"),
            resetTime: () => clockMachineHook.service.send("RESET"),
            handleFail: () => alert("got fail!"),
        })
        , [activeDevice]); //The machine must be restarted with new device settings

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => devices.filter(device => device.kind === "videoinput"))
            .then(devices => {
                setDevices(some(devices));
                if(devices.length) {
                    setActiveDevice(some(devices[0].deviceId));
                }
            })
    }, []);

    //console.log(controllerMachineHook.state.value);

    const onPlayerEnded = () => {
        controllerMachineHook.send("STOP");
    }

    const stream = controllerMachineHook.context.recorderMeta.map(({stream}) => stream).getOrElse(null);

    const url = controllerMachineHook.context.playerMeta.map(({url}) => url).getOrElse(null);

    return el(View, null, addElementKeys([
        devices.map(ds => 
            el(DevicePicker, {
                devices: ds, 
                current: activeDevice, 
                onSelected: (id:string) => setActiveDevice(some(id))
            })
        ).getOrElse(null), 
        el(MediaController, {
            machineHook: controllerMachineHook,
            iconOverrides: {
                record: "fas fa-video",
            }
        }),
        el(Clock, {machineHook: clockMachineHook}),
        controllerMachineHook.state.matches("recording")
        || controllerMachineHook.state.matches("playing")
            ? el(Video, {stream, url, onEnded: onPlayerEnded})
            : null
    ]));

}

