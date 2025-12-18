import React from 'react';

import { Arrow } from '../shapes/arrow';
import { Shape } from '../shapes/base';
import { Elipse } from '../shapes/elipse';
import { Freehand } from '../shapes/freehand';
import { Line } from '../shapes/line';
import { Rectangle } from '../shapes/rectangle';

import { Modes, ShapeOptions } from '../types';

import { ArrowEditor } from './shape-editors/arrow';
import { ElipseEditor } from './shape-editors/elipse';
import { FreehandEditor } from './shape-editors/freehand';
import { LineEditor } from './shape-editors/line';
import { RectangleEditor } from './shape-editors/rectangle';

import { DefaultEditor } from './shape-editors/default-editor';

import "./styles.css";

export const Instruments = ({ shape, shapeOptions, currentMode, changeMode, requestRedraw, changeShapeOpts }: { shape: Shape | null, shapeOptions: ShapeOptions, currentMode: Modes, changeMode: (newMode: Modes) => void, requestRedraw: () => void, changeShapeOpts: (newOpts: Partial<ShapeOptions>) => void }) => {
    const handleOptionsChange = (newOpts: Partial<ShapeOptions>) => {
        changeShapeOpts(newOpts)
    }

    const getShapeEditor = () => {
        if (!shape) {
            if (currentMode === Modes.Line || currentMode === Modes.Freehand) {
                return <DefaultEditor options={{
                    strokeColor: shapeOptions.strokeColor, strokeWidth: shapeOptions.strokeWidth, opacity: shapeOptions.opacity
                }} onChange={handleOptionsChange} />
            }
            if (currentMode === Modes.Rectangle) {
                return <DefaultEditor options={{
                    strokeColor: shapeOptions.strokeColor, strokeWidth: shapeOptions.strokeWidth, opacity: shapeOptions.opacity, fillColor: shapeOptions.fillColor, roundEdges: shapeOptions.roundEdges
                }} onChange={handleOptionsChange} />
            }
            if (currentMode === Modes.Elipse) {
                return <DefaultEditor options={{
                    strokeColor: shapeOptions.strokeColor, strokeWidth: shapeOptions.strokeWidth, opacity: shapeOptions.opacity, fillColor: shapeOptions.fillColor
                }} onChange={handleOptionsChange} />
            }
            if (currentMode === Modes.Arrow) {
                return <DefaultEditor options={{
                    strokeColor: shapeOptions.strokeColor, strokeWidth: shapeOptions.strokeWidth, opacity: shapeOptions.opacity
                }} onChange={handleOptionsChange} />
            }
            if (currentMode === Modes.Typography) { }

            return;
        }

        if (shape.type === Modes.Rectangle) {
            return <RectangleEditor key={shape.id} rectangle={shape as Rectangle} requestRedraw={requestRedraw} />
        }

        if (shape.type === Modes.Elipse) {
            return <ElipseEditor key={shape.id} elipse={shape as Elipse} requestRedraw={requestRedraw} />
        }

        if (shape.type === Modes.Line) {
            return <LineEditor key={shape.id} line={shape as Line} requestRedraw={requestRedraw} />
        }

        if (shape.type === Modes.Arrow) {
            return <ArrowEditor key={shape.id} arrow={shape as Arrow} requestRedraw={requestRedraw} />
        }

        if (shape.type === Modes.Freehand) {
            return <FreehandEditor key={shape.id} freehand={shape as Freehand} requestRedraw={requestRedraw} />
        }

        return null
    }
    return <div className='instruments-panel'>
        <div>
            <p>Modes</p>
            <button onClick={() => changeMode(Modes.Select)}>Normal</button>
            <button onClick={() => changeMode(Modes.Rectangle)}>Rect</button>
            <button onClick={() => changeMode(Modes.Elipse)}>Elipse</button>
            <button onClick={() => changeMode(Modes.Freehand)}>Draw</button>
            <button onClick={() => changeMode(Modes.Line)}>Line</button>
            <button onClick={() => changeMode(Modes.Arrow)}>Arrow</button>
            <button onClick={() => changeMode(Modes.Typography)}>Text</button>
        </div>
        {getShapeEditor()}
    </div>
}