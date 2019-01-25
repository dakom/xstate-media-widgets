import {createElement as el} from "react";
import {render} from "react-dom";
import {addElementKeys} from "utils/Utils";
import {Label} from "components/label/Label";
import {AudioWidget} from "components/media/audio/widget/AudioWidget";
import {VideoWidget} from "components/media/video/widget/VideoWidget";
import {KeylogWidget} from "components/media/keylog/widget/KeylogWidget";
import "./Main.scss";

const App = addElementKeys([
    el(Label, {label: "Audio"}),
    el(AudioWidget),
    el(Label, {label: "Video (coming soon...)"}),
    el(VideoWidget),
    el(Label, {label: "Keylog (coming soon...)"}),
    el(KeylogWidget),
]);

render(App, document.getElementById("app"));
