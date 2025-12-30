import { FaItalic } from "react-icons/fa6";
import { FaA } from "react-icons/fa6";
import { FaBold } from "react-icons/fa6";

import { FontStyle } from "../../../types";

import { IconButton } from "./icon-button";

import "./styles.css";

export const FontStyler = (props: {
    currentStyle: FontStyle;
    onStyleChange: (newVal: number) => void;
}) => {
    return (
        <div className='buttons-section'>
            <p className='title'>Font Style</p>
            <div className='modes-container-row'>
                <IconButton
                    selected={props.currentStyle === FontStyle.Normal}
                    onClick={() => props.onStyleChange(FontStyle.Normal)}
                    Icon={FaA}
                    tooltip='Normal'
                />
                <IconButton
                    selected={props.currentStyle === FontStyle.Bold}
                    onClick={() => props.onStyleChange(FontStyle.Bold)}
                    Icon={FaBold}
                    tooltip='Bold'
                />
                <IconButton
                    selected={props.currentStyle === FontStyle.Italic}
                    onClick={() => props.onStyleChange(FontStyle.Italic)}
                    Icon={FaItalic}
                    tooltip='Italic'
                />
            </div>
        </div>
    );
};
