import {createElement as el} from "react";
import {render} from "react-dom";
import {AudioWidget} from "components/media/audio/widget/AudioWidget";
import "./Main.scss";

const App = el(AudioWidget);

render(App, document.getElementById("app"));
