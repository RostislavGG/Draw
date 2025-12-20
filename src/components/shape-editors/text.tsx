import React from 'react';

import { DEFAULT_FILL_COLOR_OPTIONS, DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';
import { Typography } from '../../shapes/typography';

import { FontStyle, TextAlign } from '../../types';

import { ColorPicker } from './helpers/color-picker';
import { Opacity } from './helpers/opacity';
import { FontSize } from './helpers/font-size';
import { TextAlign as TextAlignEditor } from './helpers/text-align';
import { FontStyler } from './helpers/font-styles';

export const TypographyEditor = ({ textShape, requestRedraw }: { textShape: Typography, requestRedraw: () => void }) => {
    const [fontSize, setFontSize] = React.useState(textShape.fontSize);
    const [strokeColor, setStrokeColor] = React.useState(textShape.color);
    const [fillColor, setFillColor] = React.useState(textShape.backgroundColor);
    const [opacity, setOpacity] = React.useState(textShape.opacity);
    const [textAlling, setTextAlign] = React.useState(textShape.textAlign);
    const [fontStyle, setFontStyle] = React.useState(textShape.fontStyle)

    const onFontSizeChange = (newSize: number) => {
        setFontSize(newSize);
        textShape.fontSize = newSize;
        requestRedraw();
    }

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        textShape.color = newColor;
        requestRedraw();
    }

    const onFillColorChange = (newColor: string) => {
        setFillColor(newColor);
        textShape.backgroundColor = newColor;
        requestRedraw();
    }

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        textShape.opacity = newVal;
        requestRedraw();
    }

    const onTextAlignChange = (newVal: TextAlign) => {
        setTextAlign(newVal);
        textShape.textAlign = newVal;
        requestRedraw();
    }

    const onFontStyleChange = (newVal: FontStyle) => {
        setFontStyle(newVal);
        textShape.fontStyle = newVal;
        requestRedraw();
    }

    return <div>
        <ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={strokeColor} label="Color" onColorChange={onStrokeColorChange} />
        <ColorPicker colorOptions={DEFAULT_FILL_COLOR_OPTIONS} currentColor={fillColor} label="Background" onColorChange={onFillColorChange} />
        <FontSize currentSize={fontSize} onChange={onFontSizeChange} />
        <FontStyler currentStyle={fontStyle} onStyleChange={onFontStyleChange} />
        <TextAlignEditor currentAlign={textAlling} onChange={onTextAlignChange} />
        <Opacity currentValue={opacity} onChange={onOpacityChange} />
    </div>
}