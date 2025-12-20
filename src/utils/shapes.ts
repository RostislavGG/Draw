import { v4 as uuidv4 } from "uuid";

import { Shape } from "../shapes/base";
import { Freehand } from "../shapes/freehand";
import { Rectangle } from "../shapes/rectangle";
import { Line } from "../shapes/line";
import { Arrow } from "../shapes/arrow";
import { Elipse } from "../shapes/elipse";
import { Typography } from "../shapes/typography";

import { Modes, ShapeOptions } from "../types";

export const createShape = (
    mode: Modes,
    x: number,
    y: number,
    options: ShapeOptions
): Shape => {
    if (mode === Modes.Freehand) {
        return new Freehand(
            uuidv4(),
            x,
            y,
            options.strokeWidth,
            options.strokeColor,
            options.opacity
        );
    }

    if (mode === Modes.Line) {
        return new Line(
            uuidv4(),
            x,
            y,
            options.strokeWidth,
            options.strokeColor,
            options.opacity
        );
    }

    if (mode === Modes.Arrow) {
        return new Arrow(
            uuidv4(),
            x,
            y,
            options.strokeWidth,
            options.strokeColor,
            options.opacity
        );
    }

    if (mode === Modes.Elipse) {
        return new Elipse(
            uuidv4(),
            x,
            y,
            options.strokeWidth,
            options.strokeColor,
            options.fillColor,
            options.opacity
        );
    }

    return new Rectangle(
        uuidv4(),
        x,
        y,
        options.strokeWidth,
        options.strokeColor,
        options.fillColor,
        options.roundEdges,
        options.opacity
    );
};

export const createTextShape = (
    x: number,
    y: number,
    text: string,
    options: ShapeOptions
) => {
    return new Typography(
        uuidv4(),
        x,
        y,
        text,
        options.fontSize,
        options.textAlign,
        options.fontStyle,
        options.strokeColor,
        options.fillColor,
        options.opacity
    );
};
