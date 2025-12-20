import React from 'react';

import { Freehand } from '../../shapes/freehand';
import { DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';
import { ShapeOptions } from '../../types';

import { StrokeWidth } from './helpers/stroke-width';
import { ColorPicker } from './helpers/color-picker';
import { Opacity } from './helpers/opacity';

export const FreehandEditor = ({ freehand, requestRedraw, updateDefaultOpts }: { freehand: Freehand, requestRedraw: () => void, updateDefaultOpts: (newOpts: Partial<ShapeOptions>) => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(freehand.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(freehand.strokeColor);
    const [opacity, setOpacity] = React.useState(freehand.opacity);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        freehand.strokeWidth = newWidth;

        updateDefaultOpts({
            strokeWidth: newWidth
        })
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        freehand.strokeColor = newColor;

        updateDefaultOpts({
            strokeColor: newColor
        })
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        freehand.opacity = newVal;

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