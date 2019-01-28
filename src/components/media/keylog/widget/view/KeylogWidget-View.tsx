import * as React from "react";
import "./KeylogWidget.scss";

import {KeyEvent} from "components/media/keylog/types/Keylog-Types";

export const View = ({children}) => (
    <div className="keylog__widget">
        {children}
    </div>
)

export const KeyList = ({keys}:{keys:Array<string>}) => (
    <ul>
    {keys.map((key, idx) => <li key={idx}>{key}</li>)}
    </ul>
)
