import {
    DEFAULT_FILL_COLOR_OPTIONS,
    DEFAULT_STROKE_COLOR_OPTIONS,
} from "../../constants/colors";

import { FontStyle, ShapeOptions, TextAlign } from "../../types";

import { ColorPicker } from "./helpers/color-picker";
import { StrokeWidth } from "./helpers/stroke-width";
import { Opacity } from "./helpers/opacity";
import { Edges } from "./helpers/edges";
import { FontSize } from "./helpers/font-size";
import { TextAlign as TextAlignEditor } from "./helpers/text-align";
import { FontStyler } from "./helpers/font-styles";

export const DefaultEditor = ({
    options,
    onChange,
}: {
    options: Partial<ShapeOptions>;
    onChange: (newOpts: Partial<ShapeOptions>) => void;
}) => {
    const res = [];

    const handleStrokeColorChange = (newCol: string) => {
        onChange({ strokeColor: newCol });
    };

    const handleFillColorChange = (newCol: string) => {
        onChange({ fillColor: newCol });
    };

    const handleFontSizeChange = (newSize: number) => {
        onChange({ fontSize: newSize });
    };

    const handleFontStyleChange = (newStyle: FontStyle) => {
        onChange({ fontStyle: newStyle });
    };

    const handleTextAlignChange = (newAlign: TextAlign) => {
        onChange({ textAlign: newAlign });
    };

    const handleStrokeWidthChange = (newWidth: number) => {
        onChange({ strokeWidth: newWidth });
    };

    const handleOpacityChange = (newVal: number) => {
        onChange({ opacity: newVal });
    };

    const handleEdgesChange = (newVal: boolean) => {
        onChange({ roundEdges: newVal });
    };

    if (options.strokeColor != null) {
        res.push(
            <ColorPicker
                key='main-color'
                colorOptions={DEFAULT_STROKE_COLOR_OPTIONS}
                currentColor={options.strokeColor}
                label='Color'
                onColorChange={handleStrokeColorChange}
            />
        );
    }

    if (options.fillColor != null) {
        res.push(
            <ColorPicker
                key='fill-color'
                colorOptions={DEFAULT_FILL_COLOR_OPTIONS}
                currentColor={options.fillColor}
                label='Background'
                onColorChange={handleFillColorChange}
            />
        );
    }

    if (options.fontSize != null) {
        res.push(
            <FontSize
                currentSize={options.fontSize}
                onChange={handleFontSizeChange}
            />
        );
    }

    if (options.fontStyle != null) {
        res.push(
            <FontStyler
                currentStyle={options.fontStyle}
                onStyleChange={handleFontStyleChange}
            />
        );
    }

    if (options.textAlign != null) {
        res.push(
            <TextAlignEditor
                currentAlign={options.textAlign}
                onChange={handleTextAlignChange}
            />
        );
    }

    if (options.strokeWidth != null) {
        res.push(
            <StrokeWidth
                currentWidth={options.strokeWidth}
                onChange={handleStrokeWidthChange}
            />
        );
    }

    if (options.roundEdges != null) {
        res.push(
            <Edges rounded={options.roundEdges} onChange={handleEdgesChange} />
        );
    }

    if (options.opacity != null) {
        res.push(
            <Opacity
                currentValue={options.opacity}
                onChange={handleOpacityChange}
            />
        );
    }

    return <div>{res}</div>;
};
