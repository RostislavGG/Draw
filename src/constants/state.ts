import { FontStyle, ShapeOptions, TextAlign } from "../types";

import {
    DEFAULT_FILL_COLOR_OPTIONS,
    DEFAULT_STROKE_COLOR_OPTIONS,
} from "./colors";
import { FONT_SIZES } from "./font";
import { STROKE_WIDTHS } from "./stroke";

export const DEFAULT_INSTRUMENTS_STATE: ShapeOptions = {
    strokeColor: DEFAULT_STROKE_COLOR_OPTIONS[0],
    fillColor: DEFAULT_FILL_COLOR_OPTIONS[0],
    strokeWidth: STROKE_WIDTHS.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    fontStyle: FontStyle.Normal,
    textAlign: TextAlign.Left,
    opacity: 1,
    roundEdges: false,
};
