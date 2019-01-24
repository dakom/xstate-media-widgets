import {createElement as el} from "react";
import {View, ViewProps} from "./view/Label-View";

export const Label = (props:ViewProps) => {
    return el(View, props)
}
