import { ShapeOptions } from "../types";

import {
    DEFAULT_FILL_COLOR_OPTIONS,
    DEFAULT_STROKE_COLOR_OPTIONS,
} from "./colors";
import { DEAFULT_STROKE_WIDTHS } from "./stroke";

export const DEFAULT_INSTRUMENTS_STATE: ShapeOptions = {
    strokeWidth: DEAFULT_STROKE_WIDTHS.MEDIUM,
    strokeColor: DEFAULT_STROKE_COLOR_OPTIONS[0],
    fillColor: DEFAULT_FILL_COLOR_OPTIONS[0],
    opacity: 1,
    roundEdges: false,
};
