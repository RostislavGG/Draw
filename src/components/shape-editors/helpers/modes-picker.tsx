import React from 'react';

import { FaRegSquare } from "react-icons/fa6";
import { FiMousePointer } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import { LuPenLine } from "react-icons/lu";
import { BsDashLg } from "react-icons/bs";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { IoTextSharp } from "react-icons/io5";
import { PiEraser } from "react-icons/pi";

import { Modes } from "../../../types"

import { IconButton } from "./icon-button";

export const ModesPicker = (props: { currentMode: Modes, changeMode: (newMode: Modes) => void }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const active = document.activeElement as HTMLElement | null;
        if (active && ref.current?.contains(active)) active.blur();
    }, [props.currentMode]);

    return <div ref={ref} className="modes-container buttons-section">
        <div className="modes-container-row"><IconButton selected={props.currentMode === Modes.Select} tooltip='Select — S' onClick={() => props.changeMode(Modes.Select)} Icon={FiMousePointer} />
            <IconButton selected={props.currentMode === Modes.Rectangle} tooltip='Rectangle — R' onClick={() => props.changeMode(Modes.Rectangle)} Icon={FaRegSquare} />
            <IconButton selected={props.currentMode === Modes.Elipse} tooltip='Circle — C' onClick={() => props.changeMode(Modes.Elipse)} Icon={FaRegCircle} />
            <IconButton selected={props.currentMode === Modes.Typography} tooltip='Text — T' onClick={() => props.changeMode(Modes.Typography)} Icon={IoTextSharp} />
        </div>
        <div className="modes-container-row"><IconButton selected={props.currentMode === Modes.Freehand} tooltip='Draw — D' onClick={() => props.changeMode(Modes.Freehand)} Icon={LuPenLine} />
            <IconButton selected={props.currentMode === Modes.Line} tooltip='Line — L' onClick={() => props.changeMode(Modes.Line)} Icon={BsDashLg} />
            <IconButton selected={props.currentMode === Modes.Arrow} tooltip='Arrow — A' onClick={() => props.changeMode(Modes.Arrow)} Icon={HiOutlineArrowLongRight} /><IconButton selected={props.currentMode === Modes.Eraser} tooltip='Eraser — E' onClick={() => props.changeMode(Modes.Eraser)} Icon={PiEraser} /></div>
    </div>
}