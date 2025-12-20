import React from 'react';

import { Line } from "../../shapes/line";
import { DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';
import { ShapeOptions } from '../../types';

import { StrokeWidth } from './helpers/stroke-width';
import { ColorPicker } from './helpers/color-picker';
import { Opacity } from './helpers/opacity';

export const LineEditor = ({ line, requestRedraw, updateDefaultOpts }: { line: Line, requestRedraw: () => void, updateDefaultOpts: (newOpts: Partial<ShapeOptions>) => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(line.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(line.strokeColor);
    const [opacity, setOpacity] = React.useState(line.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        line.strokeWidth = newWidth;

        updateDefaultOpts({
            strokeWidth: newWidth
        })
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        line.strokeColor = newColor;

        updateDefaultOpts({
            strokeColor: newColor
        })
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        line.opacity = newVal;

        updateDefaultOpts({
            opacity: newVal
        })
        requestRedraw();
    }

    return <div>
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Color" onColorChange={onStrokeColorChange} />
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}