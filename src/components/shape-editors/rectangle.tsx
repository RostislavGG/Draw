import React from 'react';

import { Rectangle } from '../../shapes/rectangle';
import { DEFAULT_FILL_COLOR_OPTIONS, DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';

import { ColorPicker } from './helpers/color-picker';
import { StrokeWidth } from './helpers/stroke-width';
import { Opacity } from './helpers/opacity';
import { Edges } from './helpers/edges';

export const RectangleEditor = ({ rectangle, requestRedraw }: { rectangle: Rectangle, requestRedraw: () => void }) => {
    const [strokeWidth, setStrokeWidth] = React.useState(rectangle.strokeWidth);
    const [strokeColor, setStrokeColor] = React.useState(rectangle.strokeColor);
    const [fillColor, setFillColor] = React.useState(rectangle.fillColor);
    const [opacity, setOpacity] = React.useState(rectangle.opacity);
    const [roundEdges, setRoundEdges] = React.useState(rectangle.roundEdges);

    const onStrokeWidthChange = (newWidth: number) => {
        setStrokeWidth(newWidth);
        rectangle.strokeWidth = newWidth;
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        rectangle.strokeColor = newColor;
        requestRedraw();
    }

    const onFillColorChange = (newColor: string) => {
        setFillColor(newColor);
        rectangle.fillColor = newColor;
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        rectangle.opacity = newVal;
        requestRedraw();
    }

    const onEdgesChange = (newVal: boolean) => {
        setRoundEdges(newVal);
        rectangle.roundEdges = newVal;
        requestRedraw();
    }

    return <div>
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Color" onColorChange={onStrokeColorChange} />
        <ColorPicker colorOptions={DEFAULT_FILL_COLOR_OPTIONS} currentColor={fillColor} label="Background" onColorChange={onFillColorChange} />
        <StrokeWidth currentWidth={strokeWidth} onChange={onStrokeWidthChange} />
        <Edges rounded={roundEdges} onChange={onEdgesChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}