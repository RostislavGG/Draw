import React from 'react';

import { Arrow } from "../../shapes/arrow";
import { DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';

import { StrokeWidth } from './helpers/stroke-width';
import { ColorPicker } from './helpers/color-picker';
import { Opacity } from './helpers/opacity';

export const ArrowEditor = ({ arrow, requestRedraw }: { arrow: Arrow, requestRedraw: () => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(arrow.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(arrow.strokeColor);
    const [opacity, setOpacity] = React.useState(arrow.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        arrow.strokeWidth = newWidth;
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        arrow.strokeColor = newColor;
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        arrow.opacity = newVal;
        requestRedraw();
    }

    return <div>
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Color" onColorChange={onStrokeColorChange} />
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}