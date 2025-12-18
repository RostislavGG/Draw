import React from 'react';

import { Elipse } from '../../shapes/elipse';
import { DEFAULT_FILL_COLOR_OPTIONS, DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';

import { ColorPicker } from './helpers/color-picker';
import { StrokeWidth } from './helpers/stroke-width';
import { Opacity } from './helpers/opacity';

export const ElipseEditor = ({ elipse, requestRedraw }: { elipse: Elipse, requestRedraw: () => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(elipse.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(elipse.strokeColor);
    const [fillColor, setFillColor] = React.useState(elipse.fillColor);
    const [opacity, setOpacity] = React.useState(elipse.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        elipse.strokeWidth = newWidth;
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        elipse.strokeColor = newColor;
        requestRedraw();
    }

    const onFillColorChange = (newColor: string) => {
        setFillColor(newColor);
        elipse.fillColor = newColor;
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        elipse.opacity = newVal;
        requestRedraw();
    }

    return <div>
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Stroke" onColorChange={onStrokeColorChange} />
        <ColorPicker colorOptions={DEFAULT_FILL_COLOR_OPTIONS} currentColor={fillColor} label="Background" onColorChange={onFillColorChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}