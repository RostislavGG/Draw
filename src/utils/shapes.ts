import { v4 as uuidv4 } from "uuid";

import { Shape } from "../shapes/base";
import { Freehand } from "../shapes/freehand";
import { Rectangle } from "../shapes/rectangle";

import { Modes } from "../types";

export const createShape = (mode: Modes, x: number, y: number): Shape => {
    if (mode === Modes.Freehand) {
        return new Freehand(uuidv4(), x, y, 8, "#ff0000");
    }

    return new Rectangle(uuidv4(), x, y, 4, "#ffff00");
};
