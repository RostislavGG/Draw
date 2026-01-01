import { IoSettingsOutline } from "react-icons/io5";
import { RiScreenshot2Line } from "react-icons/ri";
import { LuScreenShare } from "react-icons/lu";

import { Modes } from "../../types";

import { IconButton } from "../shape-editors/helpers/icon-button";

import "./index.css";

export const Actions = (props: {
    currentMode: Modes;
    changeMode: (newMode: Modes) => void;
}) => {
    const onForwardClick = () => {
        props.changeMode(Modes.Forward);
    };
    const onScreenshotClick = () => {
        props.changeMode(Modes.Screenshot);
    };
    const onSettingsClick = () => {};

    return (
        <div className='actions-container'>
            <IconButton
                selected={props.currentMode === Modes.Forward}
                onClick={onForwardClick}
                Icon={LuScreenShare}
                tooltip='Forward Mouse — F'
            />
            <IconButton
                selected={props.currentMode === Modes.Screenshot}
                onClick={onScreenshotClick}
                Icon={RiScreenshot2Line}
                tooltip='Screenshot — X'
            />
            <IconButton
                selected={false}
                onClick={onSettingsClick}
                Icon={IoSettingsOutline}
                tooltip='Settings'
            />
        </div>
    );
};
