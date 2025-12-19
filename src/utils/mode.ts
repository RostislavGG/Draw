import { Modes } from "../types";

export const deriveMode = (key: string) => {
    if (key === "d") {
        return Modes.Freehand;
    }
    if (key === "r") {
        return Modes.Rectangle;
    }
    if (key === "c") {
        return Modes.Elipse;
    }
    if (key === "t") {
        return Modes.Typography;
    }
    if (key === "a") {
        return Modes.Arrow;
    }
    if (key === "l") {
        return Modes.Line;
    }
    if (key === "s") {
        return Modes.Select;
    }
    if (key === "e") {
        return Modes.Eraser;
    }

    return null;
};
