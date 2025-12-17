import { v4 as uuidv4 } from "uuid";

import { Shape } from "../shapes/base";
import { Freehand } from "../shapes/freehand";
import { Rectangle } from "../shapes/rectangle";
import { Line } from "../shapes/line";
import { Arrow } from "../shapes/arrow";

import { Modes } from "../types";
import { Typography } from "../shapes/typography";

export const createShape = (mode: Modes, x: number, y: number): Shape => {
    if (mode === Modes.Freehand) {
        return new Freehand(uuidv4(), x, y, 8, "#ff0000");
    }

    if (mode === Modes.Line) {
        return new Line(uuidv4(), x, y, 8, "#00ffff");
    }

    if (mode === Modes.Arrow) {
        return new Arrow(uuidv4(), x, y, 8, "#ff00ff");
    }

    return new Rectangle(uuidv4(), x, y, 4, "#ffff00");
};

export const createTextShape = (
    x: number,
    y: number,
    fontSize: number,
    color: string,
    text: string
) => {
    return new Typography(uuidv4(), x, y, text, fontSize, color);
};
