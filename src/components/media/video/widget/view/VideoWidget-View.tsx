import React,{useRef, useEffect} from "react";
import { Option, none, some } from 'fp-ts/lib/Option';
import "./VideoWidget.scss";

export const View = ({children}) => (
    <div className="video__widget">
        {children}
    </div>
)

export const Video = ({stream}:{stream?:MediaStream}) => {

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        //console.log("CHANGING VIDEO SOURCE", stream);
        videoRef.current.srcObject = stream;
    }, [stream])

    return <video autoPlay={true} ref={videoRef} />
}

interface DevicePickerProps {
    devices: Array<MediaDeviceInfo>;
    current: Option<string>;
    onSelected: (deviceNumber:string) => void;
}

export const DevicePicker = ({devices, current, onSelected}:DevicePickerProps) => 
    <select 
        className="video__device__picker" 
        onChange={evt => onSelected(evt.target.value)}
value={current.getOrElse("") } 
    >
        {devices.map(({deviceId: id, label}) => 
            <option value={id} key={id} >
            {label}
            </option>
        )}
    </select>

