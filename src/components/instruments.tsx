import { Arrow } from "../shapes/arrow";
import { Shape } from "../shapes/base";
import { Elipse } from "../shapes/elipse";
import { Freehand } from "../shapes/freehand";
import { Line } from "../shapes/line";
import { Rectangle } from "../shapes/rectangle";
import { Typography } from "../shapes/typography";

import { Modes, ShapeOptions } from "../types";

import { ArrowEditor } from "./shape-editors/arrow";
import { ElipseEditor } from "./shape-editors/elipse";
import { FreehandEditor } from "./shape-editors/freehand";
import { LineEditor } from "./shape-editors/line";
import { RectangleEditor } from "./shape-editors/rectangle";
import { TypographyEditor } from "./shape-editors/text";

import { DefaultEditor } from "./shape-editors/default-editor";

import { ModesPicker } from "./modes-picker";
import { Actions } from "./actions";
import { Divider } from "./divider";

import "./styles.css";

export const Instruments = ({
    isOpen,
    shape,
    shapeOptions,
    currentMode,
    changeMode,
    requestRedraw,
    changeShapeOpts,
}: {
    isOpen: boolean;
    shape: Shape | null;
    shapeOptions: ShapeOptions;
    currentMode: Modes;
    changeMode: (newMode: Modes) => void;
    requestRedraw: () => void;
    changeShapeOpts: (newOpts: Partial<ShapeOptions>) => void;
}) => {
    const handleOptionsChange = (newOpts: Partial<ShapeOptions>) => {
        changeShapeOpts(newOpts);
    };

    const getShapeEditor = () => {
        if (!shape) {
            if (currentMode === Modes.Line || currentMode === Modes.Freehand) {
                return (
                    <DefaultEditor
                        key={currentMode}
                        options={{
                            strokeColor: shapeOptions.strokeColor,
                            strokeWidth: shapeOptions.strokeWidth,
                            opacity: shapeOptions.opacity,
                        }}
                        onChange={handleOptionsChange}
                    />
                );
            }
            if (currentMode === Modes.Rectangle) {
                return (
                    <DefaultEditor
                        key={currentMode}
                        options={{
                            strokeColor: shapeOptions.strokeColor,
                            strokeWidth: shapeOptions.strokeWidth,
                            opacity: shapeOptions.opacity,
                            fillColor: shapeOptions.fillColor,
                            roundEdges: shapeOptions.roundEdges,
                        }}
                        onChange={handleOptionsChange}
                    />
                );
            }
            if (currentMode === Modes.Elipse) {
                return (
                    <DefaultEditor
                        key={currentMode}
                        options={{
                            strokeColor: shapeOptions.strokeColor,
                            strokeWidth: shapeOptions.strokeWidth,
                            opacity: shapeOptions.opacity,
                            fillColor: shapeOptions.fillColor,
                        }}
                        onChange={handleOptionsChange}
                    />
                );
            }
            if (currentMode === Modes.Arrow) {
                return (
                    <DefaultEditor
                        key={currentMode}
                        options={{
                            strokeColor: shapeOptions.strokeColor,
                            strokeWidth: shapeOptions.strokeWidth,
                            opacity: shapeOptions.opacity,
                        }}
                        onChange={handleOptionsChange}
                    />
                );
            }
            if (currentMode === Modes.Typography) {
                return (
                    <DefaultEditor
                        key={currentMode}
                        options={{
                            strokeColor: shapeOptions.strokeColor,
                            fillColor: shapeOptions.fillColor,
                            fontSize: shapeOptions.fontSize,
                            fontStyle: shapeOptions.fontStyle,
                            textAlign: shapeOptions.textAlign,
                            opacity: shapeOptions.opacity,
                        }}
                        onChange={handleOptionsChange}
                    />
                );
            }

            return;
        }

        if (shape.type === Modes.Rectangle) {
            return (
                <RectangleEditor
                    key={shape.id}
                    rectangle={shape as Rectangle}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        if (shape.type === Modes.Elipse) {
            return (
                <ElipseEditor
                    key={shape.id}
                    elipse={shape as Elipse}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        if (shape.type === Modes.Line) {
            return (
                <LineEditor
                    key={shape.id}
                    line={shape as Line}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        if (shape.type === Modes.Arrow) {
            return (
                <ArrowEditor
                    key={shape.id}
                    arrow={shape as Arrow}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        if (shape.type === Modes.Freehand) {
            return (
                <FreehandEditor
                    key={shape.id}
                    freehand={shape as Freehand}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        if (shape.type === Modes.Typography) {
            return (
                <TypographyEditor
                    key={shape.id}
                    textShape={shape as Typography}
                    requestRedraw={requestRedraw}
                    updateDefaultOpts={handleOptionsChange}
                />
            );
        }

        return null;
    };

    return (
        <div
            className={`instruments-panel ${isOpen ? "is-open" : "is-closed"}`}
        >
            <ModesPicker changeMode={changeMode} currentMode={currentMode} />
            <Divider />
            <Actions currentMode={currentMode} changeMode={changeMode} />
            {getShapeEditor()}
            <p className='footer-text'>Press Space To Hide</p>
        </div>
    );
};
