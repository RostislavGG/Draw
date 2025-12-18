import React from 'react';

import { Freehand } from '../../shapes/freehand';
import { DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';

import { StrokeWidth } from './helpers/stroke-width';
import { ColorPicker } from './helpers/color-picker';
import { Opacity } from './helpers/opacity';

export const FreehandEditor = ({ freehand, requestRedraw }: { freehand: Freehand, requestRedraw: () => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(freehand.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(freehand.strokeColor);
    const [opacity, setOpacity] = React.useState(freehand.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        freehand.strokeWidth = newWidth;
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        freehand.strokeColor = newColor;
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        freehand.opacity = newVal;
        requestRedraw();
    }

    return <div>
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Color" onColorChange={onStrokeColorChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}