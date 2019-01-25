import {createElement as el, useRef, useMemo, useState, useEffect} from "react";
import { Option, none, some } from 'fp-ts/lib/Option';
import {View, Video, DevicePicker} from "./view/VideoWidget-View";
import {addElementKeys, useMachine} from "utils/Utils";
import {makeMachine as makeMediaControllerMachine} from "components/media/generic/controller/machine/MediaController-Machine";
import {makeMachine as makeClockMachine} from "components/time/clock/machine/Clock-Machine";
import {MediaController} from "components/media/generic/controller/MediaController";
import {createPlayer, PlayerMeta} from "components/media/video/io/Video-Player";
import {createRecorder, RecorderBuffer, RecorderMeta} from "components/media/generic/recorder/io/MediaBlob-Recorder";
import {Clock} from "components/time/clock/Clock";

export const VideoWidget = () => {
    const clockMachineHook = useMachine(makeClockMachine); 

    const videoRef = useRef(null);

    const [devices, setDevices] = useState<Option<Array<MediaDeviceInfo>>>(none);

    const [activeDevice, setActiveDevice] = useState<Option<string>>(none);

    const recordingOptions = { 
        video: activeDevice.map(exact => ({deviceId: {exact}})).getOrElse(true as any),
        videoRef
    }

    const controllerMachineHook = useMachine(() => makeMediaControllerMachine<RecorderBuffer, PlayerMeta, RecorderMeta>
        (createPlayer)
        (createRecorder(recordingOptions))
        ({
            startTime: () => clockMachineHook.service.send("START"),
            stopTime: () => clockMachineHook.service.send("STOP"),
            resetTime: () => clockMachineHook.service.send("RESET"),
            handleFail: () => alert("got fail!")
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

    return el(View, null, addElementKeys([
        devices.map(ds => 
            el(DevicePicker, {
                devices: ds, 
                current: activeDevice, 
                onSelected: (id:string) => setActiveDevice(some(id))
            })
        ).getOrElse(null), 
        el(MediaController, {machineHook: controllerMachineHook}),
        el(Clock, {machineHook: clockMachineHook}),
        controllerMachineHook.state.matches("recording")
        || controllerMachineHook.state.matches("playing")
            ? el(Video, {videoRef})
            : null
    ]));

}

