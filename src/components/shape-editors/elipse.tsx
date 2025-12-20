import React from 'react';

import { Elipse } from '../../shapes/elipse';
import { DEFAULT_FILL_COLOR_OPTIONS, DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';
import { ShapeOptions } from '../../types';

import { ColorPicker } from './helpers/color-picker';
import { StrokeWidth } from './helpers/stroke-width';
import { Opacity } from './helpers/opacity';

export const ElipseEditor = ({ elipse, requestRedraw, updateDefaultOpts }: { elipse: Elipse, requestRedraw: () => void, updateDefaultOpts: (newOpts: Partial<ShapeOptions>) => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(elipse.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(elipse.strokeColor);
    const [fillColor, setFillColor] = React.useState(elipse.fillColor);
    const [opacity, setOpacity] = React.useState(elipse.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        elipse.strokeWidth = newWidth;

        updateDefaultOpts({
            strokeWidth: newWidth
        })
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        elipse.strokeColor = newColor;

        updateDefaultOpts({
            strokeColor: newColor
        })
        requestRedraw();
    }

    const onFillColorChange = (newColor: string) => {
        setFillColor(newColor);
        elipse.fillColor = newColor;

        updateDefaultOpts({
            fillColor: newColor
        })
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        elipse.opacity = newVal;

        updateDefaultOpts({
            opacity: newVal
        })
        requestRedraw();
    }

    return <div>
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Stroke" onColorChange={onStrokeColorChange} />
        <ColorPicker colorOptions={DEFAULT_FILL_COLOR_OPTIONS} currentColor={fillColor} label="Background" onColorChange={onFillColorChange} />
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}