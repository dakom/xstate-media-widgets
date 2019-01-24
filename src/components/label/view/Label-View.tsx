import * as React from "react";
import "./Label.scss";

export interface ViewProps {
    label: string;
}

export const View = ({label}:ViewProps) => (
    <div className="label">
        <div className="text">{label}</div>
    </div>
)
