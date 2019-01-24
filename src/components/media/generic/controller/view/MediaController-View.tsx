import React from "react";
import {OptionalThunk, optionIs} from "utils/Utils";
import { Option} from 'fp-ts/lib/Option'
import "./MediaController.scss";

export interface ViewProps{
    onStop: OptionalThunk;
    onPlay: OptionalThunk;
    onRecord: OptionalThunk;
    onErase: OptionalThunk;
    activeMode: Option<ActiveMode>;
}

export enum ActiveMode {
    RECORD = "record",
    PLAY = "play"
}

export const View = ({onStop, onPlay, onRecord, onErase, activeMode}: ViewProps) => {

    const activeModeIs = optionIs(activeMode);

    const getIcon = (iconName:IconName) => (maybeOnClick:OptionalThunk) => {
        const onClick = maybeOnClick.getOrElse(null);
        
        let className = (onClick == null ? "disabled" : "enabled");

        if(activeModeIs (iconName as ActiveMode)) {
            className += " active";
        }

        return (
            <div className={className} onClick={onClick}>
                <i className={iconLookup[iconName]} />
            </div>
        );
    }

    return (
        <div className="media__controller">
            {getIcon("record") (onRecord)}
            {getIcon("stop") (onStop)}
            {getIcon("play") (onPlay)}
            {getIcon("erase") (onErase)}
        </div>
    );
}


const iconLookup:{
    [K in IconName]: string
}= {
    stop: "fas fa-stop-circle",
    play: "fas fa-play-circle",
    record: "fas fa-microphone-alt",
    erase: "fas fa-trash-alt"
}

type IconName = "stop" | "play" | "record" | "erase";
