import { CiTextAlignLeft } from "react-icons/ci";
import { CiTextAlignCenter } from "react-icons/ci";
import { CiTextAlignRight } from "react-icons/ci";

import { TextAlign as TextAlignEnum } from "../../../types";

import { IconButton } from "./icon-button";

import "./styles.css";

export const TextAlign = (props: {
    currentAlign: TextAlignEnum;
    onChange: (newVal: TextAlignEnum) => void;
}) => {
    return (
        <div className='buttons-section'>
            <p className='title'>Stroke Width</p>
            <div className='modes-container-row'>
                <IconButton
                    selected={props.currentAlign === TextAlignEnum.Left}
                    onClick={() => props.onChange(TextAlignEnum.Left)}
                    Icon={CiTextAlignLeft}
                    tooltip='Left Align'
                />
                <IconButton
                    selected={props.currentAlign === TextAlignEnum.Center}
                    onClick={() => props.onChange(TextAlignEnum.Center)}
                    Icon={CiTextAlignCenter}
                    tooltip='Center Align'
                />
                <IconButton
                    selected={props.currentAlign === TextAlignEnum.Right}
                    onClick={() => props.onChange(TextAlignEnum.Right)}
                    Icon={CiTextAlignRight}
                    tooltip='Right Align'
                />
            </div>
        </div>
    );
};
