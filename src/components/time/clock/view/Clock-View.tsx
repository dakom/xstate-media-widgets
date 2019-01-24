import React from "react";
import {Option} from 'fp-ts/lib/Option';
import "./Clock.scss";

export interface ViewProps {
    elapsed: string, 
    total:Option<string>
}

export const View = ({elapsed, total}:ViewProps) => (
    <div className="time">{elapsed} {total.fold(null, t => ` / ${t}`)}</div>
)
