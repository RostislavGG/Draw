import { STROKE_WIDTHS } from "../../../constants/stroke";

import { IconButton } from "./icon-button";
import {
    StrokeBoldIcon,
    StrokeMediumIcon,
    StrokeSmallIcon,
} from "./stroke-icons";

import "./styles.css";

export const StrokeWidth = (props: {
    currentWidth: number;
    onChange: (newVal: number) => void;
}) => {
    return (
        <div className='buttons-section'>
            <p className='title'>Stroke Width</p>
            <div className='modes-container-row'>
                <IconButton
                    selected={props.currentWidth === STROKE_WIDTHS.SMALL}
                    onClick={() => props.onChange(STROKE_WIDTHS.SMALL)}
                    Icon={StrokeSmallIcon}
                    tooltip='Small'
                />
                <IconButton
                    selected={props.currentWidth === STROKE_WIDTHS.MEDIUM}
                    onClick={() => props.onChange(STROKE_WIDTHS.MEDIUM)}
                    Icon={StrokeMediumIcon}
                    tooltip='Medium'
                />
                <IconButton
                    selected={props.currentWidth === STROKE_WIDTHS.LARGE}
                    onClick={() => props.onChange(STROKE_WIDTHS.LARGE)}
                    Icon={StrokeBoldIcon}
                    tooltip='Bold'
                />
            </div>
        </div>
    );
};
