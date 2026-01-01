import { Modes, SelectGesture } from "../types";

type CursorName = CSSStyleDeclaration["cursor"];

export type UpdateCursorArgs = {
    canvas: HTMLCanvasElement | null;
    isFocused: boolean;
    isPointerOverCanvas: boolean;
    mode: Modes;
    gesture: SelectGesture;
    isMouseDown: boolean;
    isEditingText: boolean;
    hitHandleCursor?: CursorName | null;
    hitBorderCursor?: CursorName | null;
    isHoveringShape?: boolean;
};

const NON_DRAWING_MODES = new Set<Modes>([
    Modes.Select,
    Modes.Screenshot,
    Modes.Forward,
]);

export const isShapeDrawingMode = (mode: Modes) => {
    return !NON_DRAWING_MODES.has(mode);
};

export const updateCanvasCursor = (args: UpdateCursorArgs): CursorName => {
    const {
        canvas,
        isFocused,
        isPointerOverCanvas,
        mode,
        gesture,
        isMouseDown,
        isEditingText,
        hitHandleCursor = null,
        hitBorderCursor = null,
        isHoveringShape = false,
    } = args;

    if (!canvas) return "default";

    if (!isFocused || !isPointerOverCanvas) {
        canvas.style.cursor = "default";
        return "default";
    }

    if (isShapeDrawingMode(mode)) {
        if (isEditingText) {
            canvas.style.cursor = "default";
            return "default";
        }

        canvas.style.cursor = "none";
        return "none";
    }

    if (mode === Modes.Select) {
        if (isMouseDown) {
            if (gesture.kind === "resize") {
                const c =
                    hitHandleCursor ??
                    hitBorderCursor ??
                    gesture.cursor ??
                    "default";
                canvas.style.cursor = c;
                return c;
            }

            if (gesture.kind === "drag-shape") {
                canvas.style.cursor = "move";
                return "move";
            }

            if (gesture.kind === "pan") {
                canvas.style.cursor = "grabbing";
                return "grabbing";
            }
        }

        if (hitHandleCursor) {
            canvas.style.cursor = hitHandleCursor;
            return hitHandleCursor;
        }
        if (hitBorderCursor) {
            canvas.style.cursor = hitBorderCursor;
            return hitBorderCursor;
        }

        if (isHoveringShape) {
            canvas.style.cursor = "move";
            return "move";
        }

        canvas.style.cursor = "default";
        return "default";
    }

    canvas.style.cursor = "default";
    return "default";
};
