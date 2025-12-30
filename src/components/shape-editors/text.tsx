import React from "react";

import {
    DEFAULT_FILL_COLOR_OPTIONS,
    DEFAULT_STROKE_COLOR_OPTIONS,
} from "../../constants/colors";
import { Typography } from "../../shapes/typography";

import { FontStyle, TextAlign, ShapeOptions } from "../../types";

import { ColorsList } from "./helpers/colors-list";
import { Opacity } from "./helpers/opacity";
import { FontSize } from "./helpers/font-size";
import { TextAlign as TextAlignEditor } from "./helpers/text-align";
import { FontStyler } from "./helpers/font-styles";

export const TypographyEditor = ({
    textShape,
    requestRedraw,
    updateDefaultOpts,
}: {
    textShape: Typography;
    requestRedraw: () => void;
    updateDefaultOpts: (newOpts: Partial<ShapeOptions>) => void;
}) => {
    const [fontSize, setFontSize] = React.useState(textShape.fontSize);
    const [strokeColor, setStrokeColor] = React.useState(textShape.color);
    const [fillColor, setFillColor] = React.useState(textShape.backgroundColor);
    const [opacity, setOpacity] = React.useState(textShape.opacity);
    const [textAlling, setTextAlign] = React.useState(textShape.textAlign);
    const [fontStyle, setFontStyle] = React.useState(textShape.fontStyle);

    const onFontSizeChange = (newSize: number) => {
        setFontSize(newSize);
        textShape.fontSize = newSize;

        updateDefaultOpts({
            fontSize: newSize,
        });
        requestRedraw();
    };

    const onStrokeColorChange = (newColor: string) => {
        setStrokeColor(newColor);
        textShape.color = newColor;

        updateDefaultOpts({
            strokeColor: newColor,
        });
        requestRedraw();
    };

    const onFillColorChange = (newColor: string) => {
        setFillColor(newColor);
        textShape.backgroundColor = newColor;

        updateDefaultOpts({
            fillColor: newColor,
        });
        requestRedraw();
    };

    const onOpacityChange = (newVal: number) => {
        setOpacity(newVal);
        textShape.opacity = newVal;

        updateDefaultOpts({
            opacity: newVal,
        });
        requestRedraw();
    };

    const onTextAlignChange = (newVal: TextAlign) => {
        setTextAlign(newVal);
        textShape.textAlign = newVal;

        updateDefaultOpts({
            textAlign: newVal,
        });
        requestRedraw();
    };

    const onFontStyleChange = (newVal: FontStyle) => {
        setFontStyle(newVal);
        textShape.fontStyle = newVal;

        updateDefaultOpts({
            fontStyle: newVal,
        });
        requestRedraw();
    };

    return (
        <div>
            <ColorsList
                colorOptions={DEFAULT_STROKE_COLOR_OPTIONS}
                currentColor={strokeColor}
                label='Color'
                onColorChange={onStrokeColorChange}
            />
            <ColorsList
                colorOptions={DEFAULT_FILL_COLOR_OPTIONS}
                currentColor={fillColor}
                label='Background'
                onColorChange={onFillColorChange}
            />
            <FontSize currentSize={fontSize} onChange={onFontSizeChange} />
            <FontStyler
                currentStyle={fontStyle}
                onStyleChange={onFontStyleChange}
            />
            <TextAlignEditor
                currentAlign={textAlling}
                onChange={onTextAlignChange}
            />
            <Opacity currentValue={opacity} onChange={onOpacityChange} />
        </div>
    );
};
